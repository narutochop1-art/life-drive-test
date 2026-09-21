(()=>{
const $=x=>document.getElementById(x);
const p=new URLSearchParams(location.search);
const invite=p.get('invite')||'';
const src=p.get('source')||'direct';
const VISITOR_KEY='life_drive_visitor_v7';
const visitorId=localStorage.getItem(VISITOR_KEY)||crypto.randomUUID();
localStorage.setItem(VISITOR_KEY,visitorId);
const sid=crypto.randomUUID();
const PUBLIC_TEST_URL='https://life-drive-test.pages.dev/';
let i=0,a=[],s,t,unlocked=false,pollTimer=null;
let currentCharacterImage=null;
let currentShareImage=null;
const ev=async(type,payload={})=>{try{const r=await fetch('/api/event',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({event_type:type,session_id:sid,visitor_id:visitorId,invite_id:invite,source:src,payload})});const text=await r.text();let data=null;try{data=JSON.parse(text)}catch{}if(!r.ok)throw new Error(`event ${r.status} ${data?.error||''} ${data?.detail||''}`.trim());return true}catch(e){console.warn('[life-drive]',type,e);return false}};
const show=id=>{document.querySelectorAll('.screen').forEach(x=>x.classList.remove('on'));$(id).classList.add('on');scrollTo(0,0)};
function render(){let q=QUESTIONS[i];if(!q||!Array.isArray(q.options)||q.options.length!==4||q.options.some(o=>!o.text))throw new Error('第'+(i+1)+'题题目或选项缺失，请检查 questions.js。');$('pg').textContent=`${i+1} / 20`;$('bar').style.width=(i+1)*5+'%';$('qn').textContent='问题 '+(i+1);$('q').textContent=q.title;$('opts').innerHTML='';q.options.forEach((o,j)=>{let b=document.createElement('button');b.className='option';b.textContent=String.fromCharCode(65+j)+' · '+o.text;b.onclick=()=>pick(j);$('opts').appendChild(b)})}
async function pick(j){a[i]=j;if(i<19){i++;render();return}s=calc(a);t=top3(s);const saved=await ev('test_complete',{top:t,scores:s,combo:keyOf(t)});if(!saved){alert('结果保存失败，请稍后重试。请不要关闭此页面。');return}result()}
function setCharacter(prefix){
 const c=CHARACTER_META[keyOf(t)];
 if(!c)return;
 const ids=prefix
   ? {name:'fullCharacterName',desc:'fullCharacterDesc',art:'fullCharacterArt',fallback:'fullCharacterFallback'}
   : {name:'characterName',desc:'characterDesc',art:'characterArt',fallback:'characterFallback'};
 const name=$(ids.name),desc=$(ids.desc),art=$(ids.art);
 if(name)name.textContent=c.visualTitle;
 if(desc)desc.textContent=c.visualDescription;
 if(!art)return;

 art.innerHTML='';
 const fb=document.createElement('div');
 fb.className='characterFallback';
 fb.textContent=c.icon+' '+c.displayName+' 加载中…';
 art.appendChild(fb);

 const img=document.createElement('img');
 img.alt=c.displayName;
 img.loading='eager';
 img.decoding='async';
 img.width=128;
 img.height=128;
 img.onload=()=>{fb.remove();currentCharacterImage=img;};
 img.onerror=()=>{
   console.error('[life-drive] character image failed:', c.assetPath);
   img.remove();
   currentCharacterImage=null;
   fb.textContent=c.icon+' '+c.displayName;
 };
 art.appendChild(img);
 img.src=c.assetPath+(c.assetPath.includes('?')?'&':'?')+'v=13';
}

function wrapCanvasText(ctx,text,maxWidth,maxLines){
 const chars=[...String(text||'')];let lines=[],line='';
 for(const ch of chars){const test=line+ch;if(ctx.measureText(test).width<=maxWidth||!line){line=test}else{lines.push(line);line=ch;if(lines.length===maxLines-1)break}}
 if(line&&lines.length<maxLines)lines.push(line);
 if(lines.length===maxLines){const original=lines[maxLines-1];const joined=lines.join('');if(joined.length<chars.length){let last=original;while(last&&ctx.measureText(last+'…').width>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…'}}
 return lines;
}
function drawRoundedImage(ctx,img,x,y,w,h,r){ctx.save();ctx.beginPath();if(ctx.roundRect){ctx.roundRect(x,y,w,h,r)}else{ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r)}ctx.clip();ctx.drawImage(img,x,y,w,h);ctx.restore()}
function makeResultImage(){
 if(!t||!currentCharacterImage)return null;
 const c=comboData(t);if(!c)return null;
 const code=keyOf(t), role=c[0], tagline=c[2], core=c[3], quote=c[8];
 const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#f5f3ef';ctx.fillRect(0,0,1080,1350);
 // header
 ctx.fillStyle='#777';ctx.font='500 28px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('你真正追求的是什么？',72,82);
 ctx.fillStyle='#191919';ctx.font='800 72px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(role,72,178);
 ctx.fillStyle='#8b7762';ctx.font='800 34px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(code,76,225);
 // character image
 const ix=690,iy=105,iw=300,ih=300;
 ctx.fillStyle='#ebe7df';ctx.beginPath();ctx.roundRect?ctx.roundRect(ix-20,iy-20,iw+40,ih+40,36):(ctx.rect(ix-20,iy-20,iw+40,ih+40));ctx.fill();
 drawRoundedImage(ctx,currentCharacterImage,ix,iy,iw,ih,28);
 // top dimensions
 ctx.fillStyle='#555';ctx.font='600 28px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('你的前三项驱动力',72,307);
 let x=72;for(const k of t){const label=D[k].name;const w=ctx.measureText(label).width+52;ctx.fillStyle='#ebe7df';ctx.beginPath();ctx.roundRect?ctx.roundRect(x,330,w,56,28):ctx.rect(x,330,w,56);ctx.fill();ctx.fillStyle='#333';ctx.font='600 25px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(label,x+26,367);x+=w+16;}
 // core analysis
 ctx.fillStyle='#555';ctx.font='600 28px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('你为什么会是这个角色',72,463);
 ctx.fillStyle='#222';ctx.font='700 38px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
 let lines=wrapCanvasText(ctx,core,900,3);let yy=520;for(const line of lines){ctx.fillText(line,72,yy);yy+=58;}
 ctx.fillStyle='#666';ctx.font='400 30px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
 lines=wrapCanvasText(ctx,tagline,900,3);yy+=22;for(const line of lines){ctx.fillText(line,72,yy);yy+=48;}
 // quote
 ctx.fillStyle='#8b7762';ctx.font='700 28px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('我的一句话',72,850);
 ctx.fillStyle='#191919';ctx.font='700 42px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';
 lines=wrapCanvasText(ctx,'“'+quote+'”',900,3);yy=910;for(const line of lines){ctx.fillText(line,72,yy);yy+=60;}
 // footer
 ctx.fillStyle='#ddd7cf';ctx.fillRect(72,1135,936,2);
 ctx.fillStyle='#555';ctx.font='500 28px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('想知道你是哪一种？打开测试：',72,1200);
 ctx.fillStyle='#191919';ctx.font='800 32px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText(PUBLIC_TEST_URL.replace(/^https?:\/\//,''),72,1255);
 ctx.fillStyle='#999';ctx.font='400 24px -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif';ctx.fillText('20题 · 约3分钟 · 无需登录',72,1302);
 return {canvas,fileName:`${code}-${role}.png`};
}
function blobFromDataUrl(dataUrl){const parts=dataUrl.split(',');const mime=parts[0].match(/:(.*?);/)[1];const bin=atob(parts[1]);const arr=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);return new Blob([arr],{type:mime})}
function isIOSDevice(){
 return /iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
}
async function copyText(text){
 try{
  if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true;}
 }catch{}
 try{
  const ta=document.createElement('textarea');
  ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';ta.style.pointerEvents='none';
  document.body.appendChild(ta);ta.focus();ta.select();
  const ok=document.execCommand('copy');ta.remove();return ok;
 }catch{return false}
}
async function waitForCharacterImage(ms=4000){
 const started=Date.now();
 while(Date.now()-started<ms){
  if(currentCharacterImage&&currentCharacterImage.complete&&currentCharacterImage.naturalWidth>0)return true;
  await new Promise(r=>setTimeout(r,100));
 }
 return !!(currentCharacterImage&&currentCharacterImage.naturalWidth>0);
}
function openShareImageModal(){
 if(!currentShareImage)return;
 const modal=$('shareImageModal'),img=$('sharePreviewImage');
 img.src=currentShareImage.dataUrl;
 img.alt=currentShareImage.fileName;
 $('shareModalTitle').textContent='你的结果图已经生成';
 $('shareModalHint').textContent=isIOSDevice()?'手机上可以直接长按图片，保存到“照片”，然后再分享到微信、小红书、抖音等。':'电脑上可以右键图片保存；也可以点击“保存图片”后再自行分享到微信、小红书、抖音等。';
 modal.classList.add('on');modal.setAttribute('aria-hidden','false');
 document.body.classList.add('shareModalOpen');
}
function closeShareImageModal(){
 const modal=$('shareImageModal');modal.classList.remove('on');modal.setAttribute('aria-hidden','true');document.body.classList.remove('shareModalOpen');
 const img=$('sharePreviewImage');img.removeAttribute('src');
}
function saveCurrentShareImage(){
 if(!currentShareImage)return;
 const a=document.createElement('a');a.href=currentShareImage.dataUrl;a.download=currentShareImage.fileName;document.body.appendChild(a);a.click();a.remove();
 const status=$('full').classList.contains('on')?$('fullShareStatus'):$('shareStatus');
 if(status)status.textContent=isIOSDevice()?'已尝试保存图片；如果系统没有直接保存，请长按上面的图片保存到照片。':'结果图片已保存，可以自行分享到微信、小红书或抖音。';
}
async function shareResultImage(){
 const shareStatus=$('full').classList.contains('on')?$('fullShareStatus'):$('shareStatus');
 try{
  const ready=await waitForCharacterImage();
  if(!ready)throw new Error('character_not_ready');
  const made=makeResultImage();if(!made)throw new Error('result_image_failed');
  const dataUrl=made.canvas.toDataURL('image/png');
  currentShareImage={dataUrl,fileName:made.fileName};
  openShareImageModal();
  if(shareStatus)shareStatus.textContent='结果图片已经生成。手机可长按图片保存，电脑可右键保存。';
  ev('share_click',{method:'result_image_preview',combo:keyOf(t)});
 }catch(e){
  console.warn('[life-drive] result image generation failed',e);
  if(shareStatus)shareStatus.textContent='结果图片生成失败，请稍后再试。';
 }
}
function isWeChatBrowser(){
 return /MicroMessenger/i.test(navigator.userAgent||'');
}
function prepareInviteUrl(u){
 try{
  history.replaceState({lifeDriveInvite:true},'',u);
  const role=comboData(t)?.[0]||'我的人生驱动力结果';
  document.title=`我测出来是「${role}」｜你真正追求的是什么？`;
 }catch{}
}
function showWeChatInviteGuide(u){
 prepareInviteUrl(u);
 const role=comboData(t)?.[0]||'我的结果';
 const modal=$('wechatShareModal');
 $('wechatShareTitle').textContent='微信里请用“转发”功能';
 $('wechatShareText').innerHTML=`<b>你的专属邀请链接已经准备好了。</b><br><br>1. 先点右上角的 <b>“⋯”</b><br>2. 选择 <b>“转发”</b> / <b>“发送给朋友”</b><br>3. 选择一位朋友发送<br><br>你不用复制链接，也不要刷新或重新测试。发送后回到这个页面，<b>停留在这里等朋友完成20题</b>，页面会自动解锁你的完整报告。<br><br><small>当前邀请对应的结果：${role}</small>`;
 modal.classList.add('on');modal.setAttribute('aria-hidden','false');document.body.classList.add('wechatShareOpen');
 ev('share_click',{method:'wechat_menu_guide',combo:keyOf(t)});
}
function closeWeChatShareGuide(){
 const modal=$('wechatShareModal');modal.classList.remove('on');modal.setAttribute('aria-hidden','true');document.body.classList.remove('wechatShareOpen');
 $('status').textContent='邀请链接已准备好。请点右上角“⋯”→“转发/发送给朋友”。发送后回到这里，不要刷新，也不用重新测试；等朋友完成20题，页面会自动解锁完整版。';
}
function shareInvite(){
 const u=location.origin+location.pathname+'?invite='+encodeURIComponent(sid)+'&source=friend';
 const status=$('status');
 if(isWeChatBrowser()){
  showWeChatInviteGuide(u);
  return;
 }
 const ios=isIOSDevice();
 const finishCopy=(ok)=>{
  if(ok){
   status.textContent=ios
    ?'邀请链接已复制。请打开微信或聊天窗口，粘贴后发送给朋友。发送后请回到这里，不要刷新，也不用重新测试；等朋友完成20题，页面会自动解锁完整版。'
    :'邀请链接已复制。请把它发给朋友；发送后不要刷新，也不用重新测试，等朋友完成20题，页面会自动解锁完整版。';
   ev('share_click',{method:ios?'copy_invite_ios':'copy_invite',combo:keyOf(t)});
  }else{
   status.textContent='复制失败。请使用浏览器的复制功能发送下面的邀请链接：'+u;
  }
 };
 if(ios){copyText(u).then(finishCopy);return;}
 if(navigator.share){
  navigator.share({title:'你真正追求的是什么？',text:`我测出来是「${combo(t)}」——${comboData(t)?.[8]||''}`,url:u})
   .then(()=>{status.textContent='邀请界面已打开。发送给朋友后，请回到这里，不要刷新，也不用重新测试；等朋友完成20题，页面会自动解锁完整版。';ev('share_click',{method:'native_invite',combo:keyOf(t)})})
   .catch(()=>{copyText(u).then(finishCopy)});
 }else copyText(u).then(finishCopy);
}

function result(){const c=comboData(t);$('combo').textContent=c?.[0]||'复合驱动力者';$('tagline').textContent=c?.[2]||'';$('freeCore').textContent=c?.[3]||'';$('freeTension').textContent=c?.[4]||'';$('shareLine').textContent=c?.[8]||'';$('dims').innerHTML=t.map((k,n)=>`<div class="dim"><div class="dh"><b>${n+1}. ${D[k].icon} ${D[k].name}</b><span>${s[k]}</span></div><div class="track"><i style="width:${Math.min(100,s[k])}%"></i></div><small>${D[k].keywords}</small></div>`).join('');$('lockTitle').textContent='还有一部分结果没有告诉你';$('lockText').textContent='你的前三项驱动力已经确定，但完整报告需要朋友完成一次测试。分享邀请给朋友后，请不要刷新这个页面，也不用重新测试；只要停留在这里，等朋友完成20题，页面就会自动解锁完整版。';$('invite').textContent='邀请朋友，解锁完整报告';$('status').textContent='';$('shareStatus').textContent='';show('result');setCharacter('');startUnlockPolling()}
async function check(){try{const r=await fetch('/api/unlock?id='+encodeURIComponent(sid),{cache:'no-store'});const d=await r.json();if(d.unlocked){unlocked=true;clearInterval(pollTimer);$('lockCard').classList.add('unlocked');$('lockTitle').textContent='🎉 完整结果已解锁';$('lockText').textContent='你的朋友已经完成测试。现在可以查看完整的你。';$('invite').textContent='查看完整报告';$('invite').onclick=full;$('status').textContent='已解锁';}}catch(e){console.warn('[life-drive] unlock check failed',e)}}
function startUnlockPolling(){clearInterval(pollTimer);check();pollTimer=setInterval(()=>{if(!unlocked)check()},3000)}
function full(){const c=comboData(t);$('fullcombo').textContent=c?.[0]||'复合驱动力者';$('fullTagline').textContent=c?.[2]||'';$('fullShareStatus').textContent='';show('full');setCharacter('full');let html=`<article class="fullsec highlight"><small>你的核心组合</small><h2>${c?.[3]||''}</h2><p>${c?.[4]||''}</p></article>`;t.forEach((k,n)=>{html+=`<article class="fullsec"><small>TOP ${n+1} · ${D[k].label}</small><h2>${D[k].icon} ${D[k].name}</h2><p>${D[k].full}</p><h3>你为什么会被它驱动</h3><p>${D[k].core}</p><h3>你最容易掉进的坑</h3><p>${D[k].risk}</p>`});html+=`<article class="fullsec"><h2>你的核心取舍</h2><p>${c?.[4]||'在不同需求发生冲突时，你会倾向于保护排名更高的驱动力。'}</p><h2>别人最容易误解你的地方</h2><p>${c?.[5]||''}</p><h2>你容易被什么样的人吸引</h2><p>${c?.[6]||''}</p><h2>你的潜在盲区</h2><p>${c?.[7]||''}</p></article><article class="fullsec"><h2>最后一句话</h2><p class="bigquote">“${c?.[8]||''}”</p></article><article class="fullsec"><small>说明</small><p>这是一项探索性自测，用来帮助你观察自己在不同人生选择中的偏好，不是经过临床验证的心理诊断或人格测量工具。</p></article>`;$('fullbody').innerHTML=html;ev('full_view',{combo:keyOf(t)})}
$('start').onclick=()=>{i=0;a=[];ev('test_start');show('quiz');render()};$('quit').onclick=()=>show('home');$('invite').onclick=shareInvite;$('restart').onclick=()=>show('home');$('again').onclick=()=>show('home');$('shareResult').onclick=shareResultImage;$('shareFullResult').onclick=shareResultImage;$('closeShareModal').onclick=closeShareImageModal;$('shareModalBackdrop').onclick=closeShareImageModal;$('saveShareImage').onclick=saveCurrentShareImage;$('wechatShareClose').onclick=closeWeChatShareGuide;$('wechatShareDone').onclick=closeWeChatShareGuide;$('wechatShareBackdrop').onclick=closeWeChatShareGuide;
addEventListener('load',()=>{ev('page_view');if(invite)ev('referral_visit',{inviter_id:invite})});
})();
