import { scripts, createMockRun, advanceMockRun } from './mock-engine.js';

const byId = (id) => document.getElementById(id);
let selected = scripts[0];
let latest = null;
let ordinal = 0;
let completed = 0;
let timer = null;
let logRows = [];

function setText(id, value) { byId(id).textContent = value; }
function count(value) { return String(value).padStart(2, '0'); }

function updateStatistics() {
  setText('stat-scripts', count(scripts.length));
  setText('stat-runs', count(ordinal));
  setText('stat-completed', count(completed));
  setText('stat-running', count(latest?.state === 'running' ? 1 : 0));
}

function renderScripts() {
  const search = byId('search').value.trim().toLocaleLowerCase();
  const category = byId('category').value;
  const results = scripts.filter((script) =>
    (!category || script.category === category) &&
    (!search || `${script.title} ${script.id} ${script.category}`.toLocaleLowerCase().includes(search))
  );
  setText('script-count', results.length);
  const list = byId('script-list');
  list.replaceChildren();
  if (results.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'list-empty';
    empty.textContent = '未找到符合条件的脚本。';
    list.append(empty);
    return;
  }
  for (const script of results) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'script-row';
    row.setAttribute('aria-pressed', String(selected.id === script.id));
    row.dataset.running = String(latest?.state === 'running' && latest.scriptId === script.id);
    row.innerHTML = '<span class="script-glyph"><svg><use href="#i-terminal"/></svg></span><span class="script-name"><strong></strong><small></small></span><span class="script-state"></span><svg><use href="#i-arrow"/></svg>';
    row.querySelector('strong').textContent = script.title;
    row.querySelector('small').textContent = `${script.id} · ${script.category}`;
    row.querySelector('.script-state').textContent = row.dataset.running === 'true' ? '运行中' : selected.id === script.id ? '已选择' : '就绪';
    row.addEventListener('click', () => {
      selected = script;
      renderScripts();
      renderDetail();
    });
    list.append(row);
  }
}

function renderDetail() {
  setText('selected-id', selected.id);
  setText('selected-title', selected.title);
  setText('selected-description', selected.description);
  setText('selected-duration', selected.duration);
  const isCurrent = latest?.scriptId === selected.id;
  const state = isCurrent ? latest.state : 'ready';
  const percent = isCurrent ? Math.round(latest.step / latest.total * 100) : 0;
  const status = byId('run-state');
  status.className = `status-pill ${state}`;
  status.innerHTML = '<span></span>';
  status.append(document.createTextNode(state === 'running' ? '执行中' : state === 'success' ? '已完成' : '待执行'));
  setText('progress-label', `${percent}%`);
  byId('progress-bar').style.width = `${percent}%`;
  byId('progress-track').setAttribute('aria-valuenow', String(percent));
  setText('run-id', isCurrent ? latest.id : '—');
  setText('run-time', isCurrent ? latest.startedAt : '—');
  setText('progress-note', !isCurrent ? '尚未执行。点击「开始模拟执行」以查看任务流程。' :
    state === 'success' ? '模拟执行成功，全部步骤已完成。' : `正在执行第 ${latest.step + 1} / ${latest.total} 步…`);
  const running = latest?.state === 'running';
  for (const id of ['run-main', 'run-detail']) {
    const button = byId(id);
    button.disabled = running;
    button.setAttribute('aria-busy', String(running));
  }
  byId('run-detail').lastChild.textContent = running ? '模拟任务执行中…' : '开始模拟执行';
  byId('run-main').lastChild.textContent = running ? '模拟执行中…' : '执行选中脚本';
}

function appendLog(message, level = 'info') {
  logRows.push({ time: new Date().toLocaleTimeString('zh-CN', { hour12: false }), level, message });
  renderLogs();
}

function renderLogs() {
  const terminal = byId('terminal-body');
  terminal.replaceChildren();
  if (logRows.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-terminal';
    empty.textContent = '> 等待模拟任务执行…';
    const hint = document.createElement('span');
    hint.textContent = '选择脚本并点击执行，系统会在此展示模拟日志。';
    empty.append(document.createElement('br'), hint);
    terminal.append(empty);
  }
  for (const row of logRows) {
    const div = document.createElement('div');
    div.className = `log-entry ${row.level}`;
    for (const [className, value] of [['log-timestamp',row.time],['log-level',row.level === 'warn' ? 'WARN' : row.level === 'event' ? 'EVENT' : 'INFO'],['log-message',row.message]]) {
      const span = document.createElement('span');
      span.className = className;
      span.textContent = value;
      div.append(span);
    }
    terminal.append(div);
  }
  terminal.scrollTop = terminal.scrollHeight;
  setText('log-count', `${logRows.length} 条事件`);
}

function startMock() {
  if (latest?.state === 'running') return;
  latest = createMockRun(selected, ++ordinal);
  latest.startedAt = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const script = selected;
  appendLog(`创建模拟任务 ${latest.id} · ${script.title}`, 'event');
  appendLog('安全检查通过：Mock 模式，无网络请求');
  renderScripts();
  renderDetail();
  updateStatistics();
  timer = window.setInterval(() => {
    latest = advanceMockRun(latest, script);
    const finished = latest.state === 'success';
    const message = latest.logs[latest.step + 1];
    if (message) appendLog(message);
    if (finished) {
      appendLog('模拟执行完成：状态 SUCCESS', 'event');
      completed += 1;
      clearInterval(timer);
      timer = null;
    }
    renderScripts();
    renderDetail();
    updateStatistics();
  }, 900);
}

for (const id of ['run-main', 'run-detail']) byId(id).addEventListener('click', startMock);
for (const id of ['search', 'category']) byId(id).addEventListener(id === 'search' ? 'input' : 'change', renderScripts);
byId('clear-logs').addEventListener('click', () => { logRows = []; renderLogs(); });
document.querySelectorAll('.side-nav a').forEach((link) => link.addEventListener('click', () => {
  document.querySelectorAll('.side-nav a').forEach((item) => item.classList.toggle('active', item === link));
}));

renderScripts();
renderDetail();
updateStatistics();
