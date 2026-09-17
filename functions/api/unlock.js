export async function onRequestGet({request,env}){
 const id=new URL(request.url).searchParams.get('id');
 if(!id)return Response.json({unlocked:false},{status:400});
 const r=await env.DB.prepare('SELECT 1 FROM unlocks WHERE inviter_id=? LIMIT 1').bind(String(id).slice(0,100)).first();
 return Response.json({unlocked:!!r,checked_at:new Date().toISOString()},{headers:{'cache-control':'no-store'}});
}
