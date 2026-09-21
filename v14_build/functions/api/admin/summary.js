export async function onRequestGet({request,env}){
  if(request.headers.get('x-admin-token')!==env.ADMIN_TOKEN)return Response.json({error:'unauthorized'},{status:401});
  const metrics=await env.DB.prepare(`
    SELECT
      COUNT(DISTINCT CASE WHEN type='page_view' THEN json_extract(payload,'$.session_id') END) AS pv,
      COUNT(DISTINCT CASE WHEN type='page_view' THEN json_extract(payload,'$.visitor_id') END) AS uv,
      COUNT(DISTINCT CASE WHEN type='test_start' THEN json_extract(payload,'$.session_id') END) AS starts,
      COUNT(DISTINCT CASE WHEN type='test_complete' THEN json_extract(payload,'$.session_id') END) AS completes,
      COUNT(DISTINCT CASE WHEN type='share_click' THEN json_extract(payload,'$.session_id') END) AS sharers,
      COUNT(*) FILTER (WHERE type='share_click') AS share_clicks,
      COUNT(*) FILTER (WHERE type='referral_visit') AS referral_visits,
      COUNT(*) FILTER (WHERE type='test_complete' AND json_extract(payload,'$.invite_id') IS NOT NULL AND json_extract(payload,'$.invite_id')!='') AS referral_completes
    FROM events`).first();
  const unlocks=await env.DB.prepare(`SELECT COUNT(*) AS count FROM unlocks`).first();
  const sources=await env.DB.prepare(`SELECT COALESCE(json_extract(payload,'$.source'),'direct') source,COUNT(*) count FROM events GROUP BY source ORDER BY count DESC`).all();
  const daily=await env.DB.prepare(`SELECT date(created_at,'unixepoch') day,type event_type,COUNT(*) count FROM events GROUP BY day,type ORDER BY day DESC LIMIT 300`).all();
  const combos=await env.DB.prepare(`SELECT json_extract(payload,'$.combo') combo,COUNT(*) count FROM events WHERE type='test_complete' AND json_extract(payload,'$.combo') IS NOT NULL GROUP BY combo ORDER BY count DESC LIMIT 20`).all();
  const dims=await env.DB.prepare(`SELECT json_extract(payload,'$.scores') scores FROM events WHERE type='test_complete' AND json_extract(payload,'$.scores') IS NOT NULL ORDER BY created_at DESC LIMIT 5000`).all();
  const completionRate=Number(metrics?.starts||0)?Math.round(Number(metrics.completes||0)/Number(metrics.starts)*1000)/10:0;
  const shareRate=Number(metrics?.completes||0)?Math.round(Number(metrics.share_clicks||0)/Number(metrics.completes)*1000)/10:0;
  const referralRate=Number(metrics?.referral_visits||0)?Math.round(Number(metrics.referral_completes||0)/Number(metrics.referral_visits)*1000)/10:0;
  const unlockRate=Number(metrics?.referral_completes||0)?Math.round(Number(unlocks?.count||0)/Number(metrics.referral_completes)*1000)/10:0;
  return Response.json({metrics:{...metrics,pv:Number(metrics?.pv||0),uv:Number(metrics?.uv||0),starts:Number(metrics?.starts||0),completes:Number(metrics?.completes||0),share_clicks:Number(metrics?.share_clicks||0),referral_visits:Number(metrics?.referral_visits||0),referral_completes:Number(metrics?.referral_completes||0),unlocks:Number(unlocks?.count||0),completion_rate:completionRate,share_rate:shareRate,referral_completion_rate:referralRate,unlock_rate:unlockRate},sources:sources.results,daily:daily.results,combos:combos.results,score_samples:dims.results});
}
