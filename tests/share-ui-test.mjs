import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const app = fs.readFileSync(path.join(root,'public/app.js'),'utf8');
const chars = fs.readFileSync(path.join(root,'public/characters.js'),'utf8');

if (html.includes('id="copy"')) throw new Error('旧的“复制邀请链接”按钮仍存在');
if (!html.includes('id="shareResult"') || !html.includes('id="shareFullResult"')) throw new Error('结果图片分享按钮缺失');
if (!html.includes('id="shareStatus"') || !html.includes('id="fullShareStatus"')) throw new Error('分享状态提示缺失');
if (!app.includes('function shareResultImage()')) throw new Error('结果图片分享函数缺失');
if (!app.includes('navigator.canShare({files:[file]})')) throw new Error('未使用图片文件分享能力');
if (!app.includes("PUBLIC_TEST_URL='https://life-drive-test.pages.dev/'")) throw new Error('生产测试地址缺失');
if (!app.includes('不要刷新这个页面，也不用重新测试')) throw new Error('等待朋友自动解锁提示不够明确');
if (!app.includes("img.src=c.assetPath+(c.assetPath.includes('?')?'&':'?')+'v=12'")) throw new Error('人物图片缓存版本未更新');

const keys=[...chars.matchAll(/^  "([A-Z]{3})": \{/gm)].map(m=>m[1]);
if (keys.length!==56) throw new Error(`人格数量=${keys.length}`);
for (const key of keys) {
  const p=path.join(root,'public/assets/characters',`${key}.webp`);
  if (!fs.existsSync(p)) throw new Error(`缺少图片 ${key}.webp`);
}

console.log(JSON.stringify({ok:true,characters:56,shareImageButtons:2,copyButtonRemoved:true,productionUrl:'https://life-drive-test.pages.dev/'},null,2));
