export async function onRequestPost({request,env}){
 try{
  if(!env.DB)return Response.json({ok:false,error:'db_unavailable'},{status:503});
  const b=await request.json();
  const ok=['page_view','test_start','test_complete','share_click','referral_visit','full_view'];
  if(!ok.includes(b.event_type)||!b.session_id||!b.visitor_id)return Response.json({ok:false,error:'bad_request'},{status:400});
  const session=String(b.session_id).slice(0,100), visitor=String(b.visitor_id).slice(0,100), inv=b.invite_id?String(b.invite_id).slice(0,100):null;
  const payloadObj=Object.assign({},b.payload||{},{visitor_id:visitor});
  await env.DB.prepare(`INSERT INTO events(session_id,event_type,invite_id,source,payload,created_at) VALUES(?,?,?,?,?,datetime('now'))`)
    .bind(session,b.event_type,inv,String(b.source||'direct').slice(0,80),JSON.stringify(payloadObj).slice(0,5000)).run();
  if(b.event_type==='test_complete'&&inv&&inv!==session){
   const inviter=await env.DB.prepare(`SELECT payload FROM events WHERE session_id=? AND event_type='test_complete' ORDER BY id DESC LIMIT 1`).bind(inv).first();
   let inviterVisitor=null;
   try{inviterVisitor=inviter?.payload?JSON.parse(inviter.payload).visitor_id:null}catch{}
   if(inviter && inviterVisitor && inviterVisitor!==visitor){
    await env.DB.prepare(`INSERT OR IGNORE INTO unlocks(inviter_id,completed_session_id,created_at) VALUES(?,?,datetime('now'))`).bind(inv,session).run();
   }
  }
  return Response.json({ok:true});
 }catch(e){console.error('event_error',e);return Response.json({ok:false,error:'event_failed'},{status:500})}
}
