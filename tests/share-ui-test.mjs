import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const html = fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const app = fs.readFileSync(path.join(root,'public/app.js'),'utf8');
const chars = fs.readFileSync(path.join(root,'public/characters.js'),'utf8');

if (html.includes('id="copy"')) throw new Error('旧的“复制邀请链接”按钮仍存在');
if (!html.includes('id="shareResult"') || !html.includes('id="shareFullResult"')) throw new Error('结果图片分享按钮缺失');
if (!html.includes('id="shareImageModal"') || !html.includes('id="sharePreviewImage"')) throw new Error('结果图片预览弹窗缺失');
if (!html.includes('id="saveShareImage"')) throw new Error('保存图片按钮缺失');
if (!app.includes('function shareResultImage()')) throw new Error('结果图片函数缺失');
if (app.includes('navigator.canShare({files:[file]})')) throw new Error('仍在直接调用原生图片文件分享，iOS/微信链路不稳定');
if (!app.includes('result_image_preview')) throw new Error('结果图片应先生成并展示');
if (!app.includes('function isIOSDevice()')) throw new Error('缺少 iOS 判断');
if (!app.includes('location.replace(u)')) throw new Error('微信邀请必须通过真实导航让邀请参数成为微信初始URL');
if (!app.includes('life_drive_result_v15')) throw new Error('缺少结果状态持久化');
if (!app.includes('life_drive_wechat_share_pending_v15')) throw new Error('缺少微信转发待处理状态');
if (!app.includes('ownerResume')) throw new Error('缺少微信分享回到原结果页的恢复逻辑');
if (!app.includes('navigator.clipboard.writeText(text)')) throw new Error('缺少稳定复制逻辑');
if (!app.includes('不要刷新，也不用重新测试')) throw new Error('自动解锁提示不够明确');
if (!app.includes("img.src=c.assetPath+(c.assetPath.includes('?')?'&':'?')+'v=13'")) throw new Error('人物图片缓存版本被错误改动');
if (app.includes('history.replaceState({lifeDriveInvite:true}')) throw new Error('不能只用 history.replaceState 设置微信邀请URL');

const keys=[...chars.matchAll(/^  "([A-Z]{3})": \{/gm)].map(m=>m[1]);
if (keys.length!==56) throw new Error(`人格数量=${keys.length}`);
for (const key of keys) {
  const p=path.join(root,'public/assets/characters',`${key}.webp`);
  if (!fs.existsSync(p)) throw new Error(`缺少图片 ${key}.webp`);
}

console.log(JSON.stringify({ok:true,characters:56,shareImageButtons:2,copyButtonRemoved:true,iosInvite:'clipboard',resultImage:'preview-modal',productionUrl:'https://life-drive-test.pages.dev/',wechatInvite:'hard-navigation-location-replace'},null,2));
