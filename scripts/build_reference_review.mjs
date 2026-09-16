import { readFile, writeFile } from 'node:fs/promises';

const base = 'artifacts/reference-review';
const sources = JSON.parse(await readFile('public/templates/references/sources.json', 'utf8'));
const names = [
  ['saas-automation', '03 / SaaS 智能自动化'],
  ['fintech-platform', '04 / 金融资产管理平台'],
  ['digital-marketing', '05 / 数字营销增长机构'],
  ['porto-accounting', '06 / Porto 经典财税会计'],
  ['crafto-corporate', '07 / Crafto 现代企业集团'],
  ['juno-toys', '08 / Juno 趣味玩具'],
  ['corpox-ai-agency', '09 / Corpox AI Agency'],
  ['corpox-consulting', '10 / Corpox Consulting'],
];
const data = names.map(([id, name]) => ({ id, name, url: sources.references[id] }));
await writeFile(`${base}/index.html`, `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Web Radar · 模版还原对照</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f2f4f7;color:#18232e;font:14px/1.6 system-ui,sans-serif}header{padding:28px 36px;background:#132b35;color:white}header small{color:#99c2bf;letter-spacing:2px}h1{font-size:27px;margin:6px 0}header p{margin:0;color:#c2d3da}.status{float:right;background:#254842;color:#baf7d9;padding:8px 15px;border-radius:20px;font-size:12px}main{max-width:1700px;margin:auto;padding:22px 28px}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:white;padding:16px;border-radius:14px;margin-bottom:20px}select,button,.link{font:inherit;border:1px solid #dde3e8;border-radius:8px;padding:9px 13px;background:white;color:#18232e;cursor:pointer}select{font-weight:650;margin-right:auto}button[aria-pressed=true]{background:#173e45;color:white;border-color:#173e45}.link{text-decoration:none}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}figure{margin:0;background:white;border:1px solid #dce3e9;border-radius:12px;overflow:hidden}figcaption{padding:12px 16px;font-weight:650;display:flex;justify-content:space-between;border-bottom:1px solid #e7ecf0}figcaption span{font-weight:400;color:#61717d;font-size:12px}.canvas{height:70vh;overflow:auto;background:#e7ecf0}.canvas img{display:block;width:100%;height:auto}.mobile .canvas img{width:390px;max-width:100%;margin:auto}.note{color:#65737e;margin:14px 0}.extra{display:flex;gap:15px;flex-wrap:wrap;margin-top:20px}.extra a{color:#285969}a:focus-visible,button:focus-visible,select:focus-visible{outline:3px solid #69b2aa;outline-offset:2px}@media(max-width:850px){header{padding:22px}main{padding:16px}.grid{grid-template-columns:1fr}.status{float:none;display:inline-block;margin-bottom:10px}.canvas{height:60vh}select{width:100%}}
</style></head><body><header><span class="status">8 个模版 · 桌面 / 手机 / 预览验证通过</span><small>WEB RADAR / TEMPLATE REVIEW</small><h1>参考站与实际模版对照</h1><p>选择模版与展示方式，查看整页结构、产品图片代入和手机端排版。</p></header><main>
<div class="toolbar"><select id="template" aria-label="选择模版"></select><button data-mode="desktop" aria-pressed="true">首屏对照</button><button data-mode="full" aria-pressed="false">整页对照</button><button data-mode="products" aria-pressed="false">代入产品</button><button data-mode="mobile" aria-pressed="false">手机端</button><a id="source" class="link" target="_blank" rel="noopener">打开参考站 ↗</a></div>
<div class="grid" id="grid"><figure><figcaption id="left-label"></figcaption><div class="canvas"><img id="left" alt="参考站效果"></div></figure><figure><figcaption id="right-label"></figcaption><div class="canvas"><img id="right" alt="实际模版效果"></div></figure></div>
<p class="note" id="note"></p><div class="extra"><a href="README.md">验证说明</a><a href="verification.json">浏览器检查结果</a><a href="../senseng-review/clean-1536.png">模版 1 / 经典工贸</a><a href="../senseng-review/video-wide-5092.png">模版 2 / 5092px 宽屏视频</a></div></main>
<script>
const templates=${JSON.stringify(data)};const select=document.getElementById('template');let mode='desktop';
for(const t of templates){const o=document.createElement('option');o.value=t.id;o.textContent=t.name;select.append(o)}
function draw(){const t=templates.find(t=>t.id===select.value);document.getElementById('source').href=t.url;document.getElementById('grid').classList.toggle('mobile',mode==='mobile');let left='../template-references/'+t.id+'/'+(mode==='full'?'full-page.png':'first-screen.png');let right=t.id+'-'+(mode==='full'?'full':mode==='products'?'products':'desktop')+'.png';let a='参考网站',b='项目模版';if(mode==='products'){b='已自动代入 8 个产品';}if(mode==='mobile'){left=t.id+'-mobile-first.png';right=t.id+'-mobile.png';a='手机端首屏';b='手机端整页';}document.getElementById('left').src=left;document.getElementById('right').src=right;document.getElementById('left-label').textContent=a;document.getElementById('right-label').textContent=b;document.querySelectorAll('.canvas').forEach(c=>c.scrollTop=0);document.getElementById('note').textContent=mode==='products'?'产品示例使用项目中的 Senseng 图片，主推产品优先进入展示位。原有图片槽位比例保持固定，底部增加完整产品列表。':mode==='mobile'?'手机截图视口：390 × 844。整页截图可在右侧滚动查看。':'桌面对照视口：1440 × 1000。公司品牌、主标题和导航接入项目资料；截图中的其余文字保留参考站示例内容。视频画面会随播放时间变化。';}
select.addEventListener('change',draw);document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));draw()}));draw();
</script></body></html>`);

await writeFile(`${base}/README.md`, `# 模版 1–10 调整与验证

## 本次结果

- 模版 1：经典工贸版按 webimg 设计素材重排 Hero、产品堆叠和品类区；统一页脚前的邮件订阅区域。
- 模版 2：使用指定 hero-video.mp4；修正素材自带的两侧纯色边缘，宽屏保持铺满。
- 模版 3–10：使用参考站原有页面结构、字体、图片、装饰、配色和版块布局重新接入模板引擎。参考素材保存在 public/templates/references，来源记录在 sources.json。
- 模版 3：首页使用参考站原版动态视频。模版 10 的视频也已完整保存在项目内。
- 选择模版后自动进入模板生成分支，已有自定义设计不再覆盖所选模版。主推产品优先绑定图片展示位，并生成完整产品列表与详情链接。
- 首页、产品列表、关于我们、产品详情、联系页面均接入模板导航。轮播、折叠问答、手机导航与视频控制使用项目内交互代码。

## 验证

- npm run check：TypeScript、280 项测试、生产构建通过。
- 8 个模版：1440px 桌面与 390px 手机端无页面横向溢出，图片加载正常，无 JavaScript 错误或资源请求失败。
- 5 类页面及沙箱预览通过；轮播、问答和本地视频交互验证通过，沙箱无 CSP 违规。
- 模版 3 视频额外验证 3440px 宽屏覆盖。
- 模版 2 在 390、2546、3440、5092px 宽度及多个播放时间点检查画面两端像素，未出现纯色边缘；自定义视频保留标准 cover 行为。
- Worker 打包 dry-run 通过。没有执行线上部署。

## 对照材料

打开 [可交互对照页](./index.html)。首屏和整页模式保留参考站示例文案以便核对版式；产品模式展示自动代入 Senseng 图片后的效果。公司名称、主标题、导航与产品数据随项目变化，其他示例文字仍来自参考模板。

检查详情：[浏览器结果](./verification.json)、[Senseng 检查](../senseng-review/README.md)、[宽屏视频像素检查](../senseng-review/video-edge-verification.txt)。

## 参考网站

${data.map(t=>`- [${t.name}](${t.url})`).join('\n')}
`);
console.log(`${base}/index.html`);
