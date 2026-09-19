const ALLOWED = new Set(['page_view','test_start','test_complete','share_click','referral_visit','full_view']);

export async function onRequestPost({request,env}){
  try{
    if(!env.DB) return Response.json({ok:false,error:'db_unavailable'},{status:503});
    const b=await request.json();
    if(!ALLOWED.has(b.event_type)||!b.session_id||!b.visitor_id){
      return Response.json({ok:false,error:'bad_request'},{status:400});
    }
    const session=String(b.session_id).slice(0,100);
    const visitor=String(b.visitor_id).slice(0,100);
    const invite=b.invite_id?String(b.invite_id).slice(0,100):null;
    const source=String(b.source||'direct').slice(0,80);
    const payload=Object.assign({},b.payload||{},{session_id:session,visitor_id:visitor,invite_id:invite,source});
    const payloadText=JSON.stringify(payload).slice(0,5000);
    const now=Math.floor(Date.now()/1000);

    await env.DB.prepare('INSERT INTO events(id,type,payload,created_at) VALUES(?,?,?,?)')
      .bind(crypto.randomUUID(),b.event_type,payloadText,now).run();

    if(b.event_type==='test_complete'&&invite&&invite!==session){
      const inviter=await env.DB.prepare(
        `SELECT payload FROM events
         WHERE type='test_complete'
           AND json_extract(payload,'$.session_id')=?
         ORDER BY created_at DESC LIMIT 1`
      ).bind(invite).first();

      if(inviter){
        await env.DB.prepare(
          `INSERT OR IGNORE INTO unlocks(id,owner_id,friend_id,created_at) VALUES(?,?,?,?)`
        ).bind(crypto.randomUUID(),invite,session,now).run();
      }
    }
    return Response.json({ok:true});
  }catch(e){
    console.error('event_error',e?.message||e);
    return Response.json({ok:false,error:'event_failed',detail:String(e?.message||e).slice(0,300)},{status:500});
  }
}
