import fs from 'node:fs';
import path from 'node:path';
const root='/Users/marwan/Documents/Golderapharm';
const state=JSON.parse(fs.readFileSync('/private/tmp/goldera-full-qa.json','utf8'));
if (!/^goldera_qa_20261004_[a-f0-9]{10}$/.test(state.schema) || new URL(state.databaseUrl).searchParams.get("schema") !== state.schema) throw new Error("Refusing to run outside the disposable QA schema");
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const base=`${root}/goldFront/app/(dashboard)`;
const routes=walk(base).filter(p=>p.endsWith('/page.tsx')&&!p.includes('[...catch]')).map(p=>p.slice(base.length).replace('/page.tsx','').replace('/[id]',`/${p.includes('/team/')?state.fixtures.rep.id:state.fixtures.doctor.id}`));
const results=[];
for (const role of ['manager','supervisor','rep']) {
  const auth=await fetch('http://localhost:5051/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:state.fixtures[role].email,password:state.password})}).then(r=>r.json());
  for (const route of routes.filter(r=>r.startsWith(`/${role}`))) {
    try {
      const response=await fetch(`${process.env.QA_FRONT_URL || "http://localhost:3002"}${route}`,{headers:{Cookie:`token=${auth.token}`},signal:AbortSignal.timeout(60000)});
      const body=await response.text();
      const errors=[...body.matchAll(/(?:Unable|Failed|Could not) to (?:load|fetch)[^<\\]{0,100}/gi)].map(m=>m[0]);
      results.push({route,status:response.status,finalPath:new URL(response.url).pathname,pass:response.status===200&&!body.includes('NEXT_HTTP_ERROR_FALLBACK;500') && !/\\"digest\\":\\"[0-9]+/.test(body) && !body.includes('Unable to load visit ownership data'),loadMessages:[...new Set(errors)]});
    } catch(e){results.push({route,pass:false,error:e.message});}
  }
}
const output={total:results.length,passed:results.filter(r=>r.pass).length,results};fs.writeFileSync(`${root}/audit/2026-10-04/full-system/routes.json`,JSON.stringify(output,null,2));console.log(JSON.stringify(output,null,2));
