export async function onRequestPost({request,env}){
 try{
  const b=await request.json();
  const ok=['page_view','test_start','test_complete','share_click','referral_visit','full_view'];
  if(!ok.includes(b.event_type)||!b.session_id||!b.visitor_id)return Response.json({ok:false},{status:400});
  const session=String(b.session_id).slice(0,100),visitor=String(b.visitor_id).slice(0,100),inv=b.invite_id?String(b.invite_id).slice(0,100):null;
  await env.DB.prepare(`INSERT INTO events(session_id,visitor_id,event_type,invite_id,source,payload,created_at) VALUES(?,?,?,?,?,?,datetime('now'))`).bind(session,visitor,b.event_type,inv,String(b.source||'direct').slice(0,80),JSON.stringify(b.payload||{}).slice(0,5000)).run();
  if(b.event_type==='test_complete'&&inv&&inv!==session){
   const inviter=await env.DB.prepare(`SELECT visitor_id FROM events WHERE session_id=? AND event_type='test_complete' LIMIT 1`).bind(inv).first();
   if(inviter && inviter.visitor_id && inviter.visitor_id!==visitor){
    await env.DB.prepare(`INSERT OR IGNORE INTO unlocks(inviter_id,completed_session_id,created_at) VALUES(?,?,datetime('now'))`).bind(inv,session).run();
   }
  }
  return Response.json({ok:true});
 }catch(e){console.error('event_error',e);return Response.json({ok:false},{status:500})}
}
