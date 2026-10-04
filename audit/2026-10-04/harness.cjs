// Read-only audit harness. Real source modules, Express routes, JWT and Multer;
// synthetic Prisma and Cloudinary boundaries. Never loads project .env files.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const root = path.resolve(__dirname, '../..');
const backRequire = createRequire(path.join(root, 'goldBack/package.json'));
const frontRequire = createRequire(path.join(root, 'goldFront/package.json'));
const express = backRequire('express');
const jwt = backRequire('jsonwebtoken');
const ts = frontRequire('typescript');
const secret = 'isolated-audit-secret-not-a-real-credential';
const users = [
  {id:'rep-a',name:'Audit Representative A',email:'rep@audit.invalid',role:'MEDICAL_REP',managerId:'manager-a',supervisorId:'supervisor-a',isActive:true},
  {id:'rep-b',name:'Audit Representative B',email:'other@audit.invalid',role:'MEDICAL_REP',managerId:'manager-b',supervisorId:'supervisor-b',isActive:true},
  {id:'manager-a',name:'Audit Manager A',email:'manager@audit.invalid',role:'MANAGER',isActive:true},
  {id:'supervisor-a',name:'Audit Supervisor A',email:'supervisor@audit.invalid',role:'SUPERVISOR',isActive:true},
  {id:'disabled-rep',name:'Disabled Audit User',email:'disabled@audit.invalid',role:'MEDICAL_REP',isActive:false},
];
const doctors = [{id:'doctor-a',nameEN:'Audit Doctor',nameAR:'طبيب تجريبي',accountName:'Audit Clinic',specialty:'General',class:'A',subRegion:'Audit Region'}];
const products = [{id:'product-a',name:'Audit Product',description:'Synthetic fixture',price:100}];
const stamp = '2026-10-04T09:00:00.000Z';
let requests=[], reports=[], visits=[], uploads=[], calls=[], failVisitUpdate=false, failRequestCreate=false;
function reset() {
  requests=[]; reports=[]; uploads=[]; calls=[]; failVisitUpdate=false; failRequestCreate=false;
  visits=[{id:'visit-a',userId:'rep-a',date:stamp,status:'SCHEDULED',doctorId:'doctor-a',doctor:doctors[0],samples:[]},
    {id:'visit-b',userId:'rep-b',date:stamp,status:'CANCELLED',doctorId:'doctor-a',doctor:doctors[0],samples:[]}];
}
reset();
function matches(record, where={}) { return Object.entries(where).every(([k,v]) => v && typeof v==='object' && 'in' in v ? v.in.includes(record[k]) : record[k]===v); }
function selectUser(u) { return u && {...u}; }
const prisma={
  $transaction: async (arg) => {
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    if (typeof arg === 'function') {
      return arg(prisma);
    }
    return arg;
  },
  user:{
    findUnique:async q=>{calls.push(['user.findUnique',q]);return selectUser(users.find(u=>q.where.id?u.id===q.where.id:u.email===q.where.email));},
    create:async q=>{calls.push(['user.create',q]);const u={id:'signup-audit',...q.data};users.push(u);return u;},
    findMany:async q=>{calls.push(['user.findMany',q]);return users.filter(u=>matches(u,q.where));},
    update:async q=>{calls.push(['user.update',q]);const u=users.find(u=>u.id===q.where.id);if(q.data.leaveDaysCountTotal)u.leaveDaysCountTotal=(u.leaveDaysCountTotal||0)+q.data.leaveDaysCountTotal.increment;return u;}
  },
  request:{
    findUnique:async q=>{calls.push(['request.findUnique',q]);const r=requests.find(r=>r.id===q.where.id);if(!r)return null;const res={...r};if(q.include?.user)res.user=users.find(u=>u.id===r.userId);return res;},
    create:async q=>{calls.push(['request.create',q]);if(failRequestCreate)throw new Error('Injected database failure');const d=q.data;const r={...d,id:'request-'+(requests.length+1),userId:d.user.connect.id,user:users.find(u=>u.id===d.user.connect.id),status:'PENDING',createdAt:stamp,updatedAt:stamp,response:null,responseDate:null,handledAt:null,pdfs:d.pdfs.set||d.pdfs,doctors:(d.doctors.connect||[]).map(x=>doctors.find(y=>y.id===x.id)).filter(Boolean)};requests.push(r);return r;},
    update:async q=>{calls.push(['request.update',q]);let r=requests.find(r=>r.id===q.where.id);if(!r)throw new Error('Record not found');Object.assign(r,q.data);return {...r};},
    count:async q=>{calls.push(['request.count',q]);return requests.filter(r=>matches(r,q.where)).length;},
    findMany:async q=>{calls.push(['request.findMany',q]);return requests.filter(r=>matches(r,q.where)).slice(q.skip||0,(q.skip||0)+(q.take||requests.length)).map(r=>{const x={...r};if(!q.include?.doctors)delete x.doctors;return x;});}
  },
  visit:{
    findUnique:async q=>{calls.push(['visit.findUnique',q]);const v=visits.find(v=>v.id===q.where.id);return v?{...v,reports:reports.filter(r=>r.visitId===v.id)}:null;},
    findMany:async q=>{calls.push(['visit.findMany',q]);return visits.filter(v=>matches(v,q.where));},
    update:async q=>{calls.push(['visit.update',q]);if(failVisitUpdate)throw new Error('Injected visit update failure');const v=visits.find(v=>v.id===q.where.id);if(!v)throw new Error('Record not found');Object.assign(v,q.data);return v;}
  },
  visitReport:{
    create:async q=>{calls.push(['visitReport.create',q]);const r={...q.data,id:'report-'+(reports.length+1),discussedTopics:q.data.discussedTopics||[],createdAt:stamp,updatedAt:stamp};reports.push(r);return r;},
    count:async q=>{calls.push(['visitReport.count',q]);return reports.filter(r=>matches(r,q.where)).length;},
    findMany:async q=>{calls.push(['visitReport.findMany',q]);return reports.filter(r=>matches(r,q.where)).slice(q.skip||0,(q.skip||0)+(q.take||reports.length)).map(r=>({...r,visit:{...visits.find(v=>v.id===r.visitId),createdBy:users.find(u=>u.id===visits.find(v=>v.id===r.visitId)?.userId)}}));}
  }
};
const cloud={
  uploadDocumentToCloudinary:async(buffer,options)=>{uploads.push({size:buffer.length,options});return {public_id:options?.public_id||'synthetic/file',secure_url:'https://example.invalid/audit.pdf'};},
  removeDocumentFromCloudinary:async(public_id)=>{const idx=uploads.findIndex(u=>u.options?.public_id===public_id);if(idx!==-1)uploads.splice(idx,1);}
};
const moduleCache=new Map();
async function synthetic(key,obj){if(moduleCache.has(key))return moduleCache.get(key);const m=new vm.SyntheticModule(Object.keys(obj),function(){for(const [k,v]of Object.entries(obj))this.setExport(k,v);});moduleCache.set(key,m);return m;}
async function sourceModule(filename){if(moduleCache.has(filename))return moduleCache.get(filename);const m=new vm.SourceTextModule(fs.readFileSync(filename,'utf8'),{identifier:filename});moduleCache.set(filename,m);await m.link(async(spec,ref)=>{
  if(!spec.startsWith('.')){const v=backRequire(spec);return synthetic('external:'+spec,{...v,default:v});}
  const file=path.resolve(path.dirname(ref.identifier),spec);
  if(file.endsWith('/config/db.js'))return synthetic(file,{prisma});
  if(file.endsWith('/config/index.js'))return synthetic(file,{JWT_ACCESS_SECRET_KEY:secret,JWT_ACCESS_EXPIRE_TIME:'1h'});
  if(file.endsWith('/utils/cloudinary.js'))return synthetic(file,cloud);
  return sourceModule(file);
});return m;}
const tsCache=new Map();let activeUser='rep-a';let loseNextResponse=false;
const auditPort=Number(process.env.GOLDERA_AUDIT_PORT||5069);
const base='http://127.0.0.1:'+auditPort;
async function localFetch(url,options={}){const response=await fetch(url,options);if(loseNextResponse){loseNextResponse=false;await response.text();throw new Error('Injected lost response after commit');}return response;}
async function apiFetch(endpoint,options={}){const r=await localFetch(base+endpoint,{...options,headers:{'Content-Type':'application/json',Authorization:'Bearer '+jwt.sign({userId:activeUser,role:users.find(u=>u.id===activeUser).role},secret),...options.headers}});const data=await r.json();if(!r.ok)throw data;return data;}
function loadTs(file){file=path.resolve(file);if(tsCache.has(file))return tsCache.get(file).exports;const mod={exports:{}};tsCache.set(file,mod);const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const req=spec=>{if(spec==='next/headers')return {cookies:async()=>({get:()=>({value:jwt.sign({userId:activeUser,role:users.find(u=>u.id===activeUser).role},secret)})})};if(spec==='@/services/http')return {apiFetch};if(spec==='@/lib/utils')return {buildPaginationQuery:({page,limit})=>'?' + new URLSearchParams({page:String(page||1),limit:String(limit||10)})};if(spec.startsWith('.')||spec.startsWith('@/')){let p=spec.startsWith('@/')?path.join(root,'goldFront',spec.slice(2)):path.resolve(path.dirname(file),spec);if(!p.endsWith('.ts'))p=fs.existsSync(p+'.ts')?p+'.ts':path.join(p,'index.ts');return loadTs(p);}return frontRequire(spec);};
  new Function('require','module','exports','fetch','process',compiled)(req,mod,mod.exports,localFetch,{env:{NEXT_PUBLIC_API_BASE_URL:base}});return mod.exports;}
const results=[];
function record(name,observed,evidence){results.push({name,observed,evidence});console.log(JSON.stringify(results.at(-1)));}
async function main(){
  const app=express();app.use(express.json());
  app.post('/api/auth/login',(req,res)=>{const u=users.find(u=>u.email===req.body.email);if(!u)return res.status(401).json({message:'Unknown synthetic user'});res.json({token:jwt.sign({userId:u.id,role:u.role,exp:Math.floor(Date.now()/1000)+3600},secret),data:u});});
  const guardModule=await sourceModule(path.join(root,'goldBack/middlewares/auth.middleware.js'));await guardModule.evaluate();const {guard,allowedTo}=guardModule.namespace;
  const authModule=await sourceModule(path.join(root,'goldBack/controllers/auth.controller.js'));await authModule.evaluate();app.post('/api/auth/signup',authModule.namespace.signup);
  app.get('/api/profiles',guard,(req,res)=>res.json({data:req.user}));
  app.get('/api/doctors',guard,(req,res)=>res.json({data:doctors,results:doctors.length}));app.get('/api/products',guard,(req,res)=>res.json({data:products,results:products.length}));
  for(const [prefix,file]of [['requests','request'],['visits','visit']]){const m=await sourceModule(path.join(root,'goldBack/routes',file+'.route.js'));await m.evaluate();app.use('/api/'+prefix,m.namespace.default);}
  for(const [role,file]of [['MANAGER','manager'],['SUPERVISOR','supervisor']]){const m=await sourceModule(path.join(root,'goldBack/controllers',file+'.controller.js'));await m.evaluate();app.get('/api/'+(role==='MANAGER'?'managers':'supervisors')+'/team/requests',guard,allowedTo(role),m.namespace.getTeamRequests);}
  app.use((err,req,res,next)=>res.status(err.statusCode||500).json({status:'error',message:err.message}));
  const server=await new Promise(resolve=>{const s=app.listen(auditPort,'127.0.0.1',()=>resolve(s));});
  const wire=async(endpoint,{user='rep-a',body,method='POST',auth=true}={})=>{const r=await fetch(base+endpoint,{method,headers:{...(auth?{Authorization:'Bearer '+jwt.sign({userId:user,role:users.find(u=>u.id===user).role},secret)}:{}),...(body instanceof FormData?{}:{'Content-Type':'application/json'})},body:body==null?undefined:body instanceof FormData?body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
  const payload=loadTs(path.join(root,'goldFront/features/requests/api/request-type-payload.ts'));
  const actions=loadTs(path.join(root,'goldFront/features/requests/api/index.ts'));
  const reportActions=loadTs(path.join(root,'goldFront/features/visits/api/reports.ts'));
  const managerReports=loadTs(path.join(root,'goldFront/features/reports/api/index.ts'));
  const common={title:'Audit Request',subject:'Synthetic subject',description:'Synthetic description',urgency:'medium'};
  const pdf=new File([Buffer.from('%PDF-1.4\nsynthetic audit fixture\n%%EOF')],'audit.pdf',{type:'application/pdf'});
  const multipart=d=>{const fd=new FormData();payload.appendCreateRequestFields(fd,payload.buildCreateRequestPayload({...common,...d}));payload.appendRequestFiles(fd,{invoice:pdf});return fd;};
  record('Unauthenticated report submission',await wire('/api/visits/visit-reports',{auth:false,body:{}}),'Real guard and route');
  record('Rep cannot approve request',await wire('/api/requests/request-x',{method:'PATCH',body:{status:'APPROVED'}}),'Real allowedTo guard');
  record('Unauthenticated signup can choose MANAGER',await wire('/api/auth/signup',{auth:false,body:{name:'Synthetic Signup',email:'signup@audit.invalid',password:'synthetic-password',dateOfBirth:'1990-01-01',role:'MANAGER'}}),'Real signup controller/JWT signing; synthetic user persistence');
  record('Disabled user can access reports',await wire('/api/visits/visit-reports',{method:'GET',user:'disabled-rep'}),'Real guard, synthetic isActive=false user');
  reset();record('Sample JSON normal completion',await actions.createRequestAction({...common,type:'SAMPLE',sampleData:[{productId:'product-a',productName:'Audit Product',amount:2}],doctorIds:['doctor-a']}),{created:requests.length,doctorConnect:requests[0]?.doctors,sampleData:requests[0]?.sampleData});
  for(const type of ['EXPENSE','MARKETING']){reset();record(type+' multipart doctor duplication',await wire('/api/requests',{body:multipart({type,doctorIds:['doctor-a'],budget:100})}),{connect:calls.find(c=>c[0]==='request.create')?.[1].data.doctors});}
  reset();record('Personal expense canonical multipart',await wire('/api/requests',{body:multipart({type:'PERSONAL_EXPENSE',visitedCity:'Cairo',visitDaysCount:1,totalExpenseAmount:100,totalExpenseData:[{name:'Taxi',amount:100}]})}),{creates:requests.length});
  reset();record('Personal expense frontend fallback completion',await actions.createRequestAction({...common,type:'PERSONAL_EXPENSE',visitedCity:'Cairo',visitDaysCount:1,totalExpenseAmount:100,totalExpenseData:[{name:'Taxi',amount:100}]},{invoice:pdf}),{creates:requests.length,storedItems:requests[0]?.totalExpenseData});
  reset();record('Leave PDF normal completion',await actions.createRequestAction({...common,type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'},{medicalReport:pdf}),{creates:requests.length,days:requests[0]?.leaveDaysCount});
  record('Leave missing attachment',await actions.createRequestAction({...common,type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'}),{creates:requests.length});
  const pngFd=multipart({type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'});pngFd.delete('pdfs');pngFd.append('pdfs',new File(['fake png'],'audit.png',{type:'image/png'}));record('UI-supported PNG rejected',await wire('/api/requests',{body:pngFd}),'Real Multer MIME filter');
  const fakePdf=multipart({type:'LEAVE',leaveType:'Sick',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'});fakePdf.delete('pdfs');fakePdf.append('pdfs',new File(['This is not PDF content'],'spoof.pdf',{type:'application/pdf'}));record('Spoofed PDF accepted for upload',await wire('/api/requests',{body:fakePdf}),{lastUpload:uploads.at(-1)});
  const largePdf=multipart({type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'});largePdf.delete('pdfs');largePdf.append('pdfs',new File([Buffer.alloc(5*1024*1024+1)],'large.pdf',{type:'application/pdf'}));record('Oversized PDF error is unmapped',await wire('/api/requests',{body:largePdf}),'Real Multer limit; error has no statusCode');
  const multiPdf=multipart({type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'});multiPdf.append('pdfs',pdf);const beforeMulti=uploads.length;record('Multiple leave PDFs silently trimmed',await wire('/api/requests',{body:multiPdf}),{sentFiles:2,uploadedFiles:uploads.length-beforeMulti});
  reset();failRequestCreate=true;record('Upload retained after persistence failure',await wire('/api/requests',{body:multipart({type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-04',leaveEndDate:'2026-10-05'})}),{uploads:uploads.length,creates:requests.length});
  reset();loseNextResponse=true;record('Lost response returns error after sample commit',await actions.createRequestAction({...common,type:'SAMPLE',sampleData:[{productId:'product-a',productName:'Audit Product',amount:2}]}),{creates:requests.length,createCalls:calls.filter(c=>c[0]==='request.create').length});record('User retry duplicates committed sample',await actions.createRequestAction({...common,type:'SAMPLE',sampleData:[{productId:'product-a',productName:'Audit Product',amount:2}]}),{creates:requests.length});
  reset();requests.push({id:'foreign-request',userId:'rep-b',type:'LEAVE',leaveDaysCount:2,status:'PENDING'});users.find(u=>u.id==='rep-b').leaveDaysCountTotal=0;
  record('Manager approves foreign request',await wire('/api/requests/foreign-request',{user:'manager-a',method:'PATCH',body:{status:'APPROVED'}}),{leaveTotal:users.find(u=>u.id==='rep-b').leaveDaysCountTotal});
  record('Repeated approval counts leave twice',await wire('/api/requests/foreign-request',{user:'manager-a',method:'PATCH',body:{status:'APPROVED'}}),{leaveTotal:users.find(u=>u.id==='rep-b').leaveDaysCountTotal});
  const report={visitId:'visit-a',duration:'15 min',rating:'5',discussedTopics:['Product efficacy'],doctorFeedback:'Good',visitPurpose:'Follow up',notes:'Audit note',samplesProvided:['Audit Product']};
  reset();record('Report completion drops discussed topics',await wire('/api/visits/visit-reports',{body:report}),{createKeys:Object.keys(calls.find(c=>c[0]==='visitReport.create')[1].data),visitStatus:visits[0].status});
  record('Duplicate report accepted',await wire('/api/visits/visit-reports',{body:report}),{reports:reports.length});
  record('Rep reports another rep cancelled visit',await wire('/api/visits/visit-reports',{body:{...report,visitId:'visit-b'}}),{foreignVisitStatus:visits[1].status});
  record('Rep arbitrary visit update',await wire('/api/visits/visit-b',{method:'PATCH',body:{status:'COMPLETED',userId:'rep-a'}}),{foreignOwner:visits[1].userId});
  reset();failVisitUpdate=true;record('Report saved after visit update fails',await wire('/api/visits/visit-reports',{body:report}),{reports:reports.length,visitStatus:visits[0].status});
  reset();await reportActions.createVisitReportAction({...report,discussedTopicsText:'Topic A, Topic B',completionLocation:{latitude:30,longitude:31,accuracy:10,capturedAt:stamp}});record('Frontend discards verified location',calls.find(c=>c[0]==='visitReport.create')?.[1].data,'Real action and controller; no location field or model');
  reports.push({...report,id:'foreign-report',userId:'rep-b',visitId:'visit-b',createdAt:stamp});record('Supervisor reads reports from other teams',await wire('/api/visits/all-visit-reports',{user:'supervisor-a',method:'GET'}),'Real route/controller; all reports returned, no team predicate');
  activeUser='manager-a';record('Manager report mapping loses representative',await managerReports.getAllVisitReportsAction(1,10),'Backend visit.createdBy omitted by frontend mapper');activeUser='rep-a';
  const originalCount=prisma.visitReport.count;prisma.visitReport.count=async()=>{throw new Error('Injected query failure');};record('All report query failure masks original error',await wire('/api/visits/all-visit-reports',{user:'manager-a',method:'GET'}),'Catch references next without declaring parameter');prisma.visitReport.count=originalCount;
  record('Manager role filter reaches nonexistent Request.role',await wire('/api/managers/team/requests?role=MEDICAL_REP',{user:'manager-a',method:'GET'}),{where:calls.filter(c=>c[0]==='request.count').at(-1)?.[1].where,modelHasRole:false});
  const schemas=loadTs(path.join(root,'goldFront/features/requests/lib/schemas/index.ts'));
  for(const [label,fields]of [['Reversed leave dates',{type:'LEAVE',leaveType:'Annual',leaveStartDate:'2026-10-06',leaveEndDate:'2026-10-04'}],['Whitespace common fields',{type:'SAMPLE',title:' ',subject:' ',description:' ',sampleData:[{productId:'product-a',productName:'Audit Product',amount:1}]}]])record(label+' passes frontend schema',schemas.submitRequestSchema.safeParse({...common,...fields}).success,'Actual Zod schema');
  fs.writeFileSync(path.join(__dirname,'test-results.json'),JSON.stringify({mode:'Synthetic persistence and upload boundaries; real source/actions/routes/guard/Multer',results},null,2));
  reset();requests.push({id:'seed-request',...common,type:'SAMPLE',userId:'rep-a',user:users[0],status:'PENDING',createdAt:stamp,updatedAt:stamp,response:null,responseDate:null,handledAt:null,sampleData:[{productId:'product-a',productName:'Audit Product',amount:2}],totalExpenseData:[],pdfs:[],doctors:[]});reports.push({...report,id:'seed-report',userId:'rep-a',createdAt:stamp,updatedAt:stamp,discussedTopics:['Fixture topic']});
  if(process.argv.includes('--serve'))console.log('AUDIT_FIXTURE_READY '+base);else server.close();
}
main().catch(e=>{console.error(e);process.exit(1);});
