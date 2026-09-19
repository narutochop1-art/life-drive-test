export async function onRequestGet({env}){
  try{
    if(!env.DB) return Response.json({ok:false,db:false,error:'db_unavailable'},{status:503});
    const tables=((await env.DB.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN ('events','unlocks') ORDER BY name`).all()).results||[]).map(r=>r.name);
    const schemas={};
    for(const name of ['events','unlocks']) schemas[name]=tables.includes(name)?((await env.DB.prepare(`PRAGMA table_info("${name}")`).all()).results||[]):[];
    const expected={events:['id','type','payload','created_at'],unlocks:['id','owner_id','friend_id','created_at']};
    const valid=Object.entries(expected).every(([name,cols])=>{const actual=new Set((schemas[name]||[]).map(x=>x.name));return cols.every(c=>actual.has(c));});
    return Response.json({ok:valid,db:true,tables,schemas},{status:valid?200:500});
  }catch(e){
    console.error('health_error',e?.message||e);
    return Response.json({ok:false,db:true,error:'db_query_failed',detail:String(e?.message||e).slice(0,300)},{status:500});
  }
}
