const KEYS=['ACP', 'ACR', 'AMC', 'AMP', 'AMR', 'AMS', 'ARP', 'ASC', 'ASP', 'ASR', 'CRP', 'EAC', 'EAM', 'EAP', 'EAR', 'EAS', 'ECP', 'ECR', 'EFA', 'EFC', 'EFM', 'EFP', 'EFR', 'EFS', 'EMC', 'EMP', 'EMR', 'EMS', 'ERP', 'ESC', 'ESP', 'ESR', 'FAC', 'FAM', 'FAP', 'FAR', 'FAS', 'FCP', 'FCR', 'FMC', 'FMP', 'FMR', 'FMS', 'FRP', 'FSC', 'FSP', 'FSR', 'MCP', 'MCR', 'MRP', 'MSC', 'MSP', 'MSR', 'SCP', 'SCR', 'SRP'];

export async function onRequestGet({request,env}){
  try{
    const missing=[];
    for(const key of KEYS){
      const url=new URL(`/assets/characters/${key}.webp`,request.url);
      const r=env.ASSETS
        ? await env.ASSETS.fetch(new Request(url.toString(),{method:'HEAD'}))
        : await fetch(url.toString(),{method:'HEAD'});
      if(!r.ok)missing.push({key,status:r.status});
    }
    return Response.json({ok:missing.length===0,total:KEYS.length,available:KEYS.length-missing.length,missing});
  }catch(e){
    return Response.json({ok:false,error:String(e?.message||e)},{status:500});
  }
}
