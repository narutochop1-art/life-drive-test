export async function onRequestGet({env}){
 try{
  if(!env.DB){
   return Response.json({ok:false,db:false,error:'db_unavailable'},{status:503});
  }
  const rows=await env.DB.prepare(
   `SELECT name FROM sqlite_master WHERE type='table' AND name IN ('events','unlocks') ORDER BY name`
  ).all();
  const tables=(rows.results||[]).map(r=>r.name);
  const hasEvents=tables.includes('events');
  const hasUnlocks=tables.includes('unlocks');
  return Response.json({
   ok:hasEvents&&hasUnlocks,
   db:true,
   tables,
   events:hasEvents,
   unlocks:hasUnlocks
  },{status:hasEvents&&hasUnlocks?200:500});
 }catch(e){
  console.error('health_error',e);
  return Response.json({ok:false,db:true,error:'db_query_failed'},{status:500});
 }
}