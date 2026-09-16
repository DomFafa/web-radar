import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import tls from 'node:tls';

const PORT = 7005;
const SOCKS_PORT = 6153;
const HTTP_PROXY_PORT = 6152;
const TARGET_HOST = 'api.openai.com';

function connectSocks5(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(SOCKS_PORT, '127.0.0.1', () => {
      socket.write(Buffer.from([0x05, 0x01, 0x00]));
    });
    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('SOCKS5 timeout'));
    });
    socket.once('data', (data) => {
      if (data[0] !== 0x05 || data[1] !== 0x00) {
        socket.destroy();
        return reject(new Error('SOCKS5 auth rejected'));
      }
      const hostBuf = Buffer.from(targetHost);
      const req = Buffer.concat([
        Buffer.from([0x05, 0x01, 0x00, 0x03, hostBuf.length]),
        hostBuf,
        Buffer.from([(targetPort >> 8) & 0xff, targetPort & 0xff]),
      ]);
      socket.write(req);
      socket.once('data', (connRes) => {
        if (connRes[1] !== 0x00) {
          socket.destroy();
          return reject(new Error('SOCKS5 connection failed'));
        }
        socket.setTimeout(0);
        resolve(socket);
      });
    });
    socket.on('error', reject);
  });
}

function connectHttpProxy(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: '127.0.0.1',
      port: HTTP_PROXY_PORT,
      method: 'CONNECT',
      path: `${targetHost}:${targetPort}`,
    });
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('HTTP proxy timeout'));
    });
    req.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        return reject(new Error(`HTTP proxy CONNECT status ${res.statusCode}`));
      }
      resolve(socket);
    });
    req.on('error', reject);
    req.end();
  });
}

async function getUpstreamSocket() {
  // 1. Try SOCKS5 on 6153 (Surge SOCKS5, user preference)
  try {
    return await connectSocks5(TARGET_HOST, 443);
  } catch {
    // 2. Try HTTP on 6152 (Surge HTTP)
    try {
      return await connectHttpProxy(TARGET_HOST, 443);
    } catch {
      // 3. Fallback to direct TCP
      return await new Promise((resolve, reject) => {
        const s = net.connect(443, TARGET_HOST, () => resolve(s));
        s.on('error', reject);
      });
    }
  }
}

const server = http.createServer(async (clientReq, clientRes) => {
  if (clientReq.method === 'GET' && clientReq.url === '/health') {
    clientRes.writeHead(200, { 'Content-Type': 'application/json' });
    clientRes.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  try {
    const rawSocket = await getUpstreamSocket();
    const tlsSocket = tls.connect({
      socket: rawSocket,
      servername: TARGET_HOST,
    });

    const upstreamReq = https.request(
      {
        host: TARGET_HOST,
        path: clientReq.url,
        method: clientReq.method,
        headers: {
          ...clientReq.headers,
          host: TARGET_HOST,
        },
        createConnection: () => tlsSocket,
      },
      (upstreamRes) => {
        clientRes.writeHead(upstreamRes.statusCode || 500, upstreamRes.headers);
        upstreamRes.pipe(clientRes);
      },
    );

    upstreamReq.on('error', (err) => {
      console.error('Upstream request error:', err.message);
      if (!clientRes.headersSent) {
        clientRes.writeHead(502, { 'Content-Type': 'application/json' });
        clientRes.end(JSON.stringify({ error: err.message }));
      }
    });

    clientReq.pipe(upstreamReq);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Proxy forwarder error:', msg);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { 'Content-Type': 'application/json' });
      clientRes.end(JSON.stringify({ error: msg }));
    }
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[OpenAI Proxy Forwarder] Ready on http://127.0.0.1:${PORT}`);
});
