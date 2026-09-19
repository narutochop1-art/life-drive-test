export async function onRequestGet({request,env}){
  try{
    if(!env.DB) return Response.json({unlocked:false,error:'db_unavailable'},{status:503});
    const id=new URL(request.url).searchParams.get('id');
    if(!id) return Response.json({unlocked:false},{status:400});
    const r=await env.DB.prepare('SELECT 1 FROM unlocks WHERE owner_id=? LIMIT 1').bind(String(id).slice(0,100)).first();
    return Response.json({unlocked:!!r,checked_at:new Date().toISOString()},{headers:{'cache-control':'no-store'}});
  }catch(e){
    console.error('unlock_error',e?.message||e);
    return Response.json({unlocked:false,error:'unlock_failed',detail:String(e?.message||e).slice(0,300)},{status:500,headers:{'cache-control':'no-store'}});
  }
}
