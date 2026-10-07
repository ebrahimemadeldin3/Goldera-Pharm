import fs from 'node:fs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const root = '/Users/marwan/Documents/Golderapharm';
const require = createRequire(`${root}/goldBack/package.json`);
require('dotenv').config({path:`${root}/goldBack/.env`,quiet:true});
const state = JSON.parse(fs.readFileSync('/private/tmp/goldera-full-qa.json','utf8'));
if (!/^goldera_qa_20261004_[a-f0-9]{10}$/.test(state.schema) || new URL(state.databaseUrl).searchParams.get("schema") !== state.schema) throw new Error("Refusing to run outside the disposable QA schema");
process.env.DATABASE_URL = state.databaseUrl;
const { prisma } = await import(`${root}/goldBack/config/db.js`);
const f = state.fixtures;
const tokens = {};
const results = [];
const run = process.argv[2] || 'baseline';
async function request(role, method, path, body) {
  const response = await fetch(`http://localhost:5051/api${path}`,{method,headers:{'Content-Type':'application/json',...(tokens[role]?{Authorization:`Bearer ${tokens[role]}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
  const data = await response.json();
  return {status:response.status,data};
}
async function test(name, action) {
  try { await action(); results.push({name,pass:true}); }
  catch(e) { results.push({name,pass:false,evidence:String(e.message).slice(0,800)}); }
}
const status = (r, expected) => assert.ok(expected.includes(r.status),`Expected ${expected.join('/')} got ${r.status}: ${r.data.message || JSON.stringify(r.data).slice(0,250)}`);
function noSecrets(value) { assert.ok(!JSON.stringify(value).includes('"password"'),'Password hash exposed in response'); }
for (const role of ['manager','supervisor','rep','rep2','outsider']) {
  await test(`Login ${role}`,async()=>{const r=await request(null,'POST','/auth/login',{email:f[role].email,password:state.password});status(r,[200]);tokens[role]=r.data.token;noSecrets(r.data);});
}
await test('Invalid login rejected',async()=>status(await request(null,'POST','/auth/login',{email:f.rep.email,password:'incorrect'}),[401]));
await test('Anonymous catalog rejected',async()=>status(await request(null,'GET','/products'),[401]));
await test('Privileged public signup rejected',async()=>status(await request(null,'POST','/auth/signup',{name:'Bad Role',email:'badrole@goldera.test',password:state.password,dateOfBirth:'1990-01-01',role:'MANAGER'}),[403]));
for (const [role,paths] of Object.entries({manager:['/products','/doctors','/pharmacies','/regions','/sub-regions','/accounts','/managers/users','/managers/team','/managers/team/requests?role=MEDICAL_REP','/visits/all?paginate=false','/visits/all?paginate=true','/visits/all-visit-reports','/plans/all','/plans/mgmt','/forecasts/all','/appraisals','/coaching-reports/all','/sales','/dashboard/manager','/profiles'],supervisor:['/supervisors/team','/supervisors/team/requests','/visits/all?paginate=false','/visits/all-visit-reports','/plans/mgmt','/forecasts/all','/coaching-reports'],rep:['/reps/me','/profiles','/products','/doctors','/pharmacies','/visits','/visits?date=2026-10-04','/visits/visit-reports','/requests','/plans','/forecasts','/appraisals/rep','/coaching-reports/rep','/sales','/dashboard/rep']})) {
  for(const path of paths) await test(`Read ${role} ${path}`,async()=>status(await request(role,'GET',path),role==='rep'&&path==='/sales'?[403]:[200]));
}
for(const [role,path] of [['manager','/managers/team'],['manager',`/managers/users?id=${f.rep.id}`],['manager',`/managers/users/${f.rep.id}`],['supervisor','/supervisors/team'],['rep','/reps/me']]) await test(`No secrets ${path}`,async()=>{const r=await request(role,'GET',path);status(r,[200]);noSecrets(r.data);});
let productId,pharmacyId,doctorId,userId,visitId,planId,forecastId,requestId,coachingId,appraisalId;
await test('Manager creates product',async()=>{const r=await request('manager','POST','/products',{name:`QA Create ${run}`,internalRef:`QA-${run}`,salesPrice:123});status(r,[201]);productId=r.data.data.id;});
await test('Product update persists',async()=>{status(await request('manager','PATCH',`/products/${productId}`,{name:'QA Edited',salesPrice:155}),[200]);assert.equal((await prisma.products.findUnique({where:{id:productId}})).salesPrice,155);});
await test('Negative product price rejected',async()=>status(await request('manager','PATCH',`/products/${productId}`,{salesPrice:-5}),[400,422]));
await test('Blank product rejected',async()=>status(await request('manager','POST','/products',{name:' ',internalRef:' ',salesPrice:5}),[400,422]));
await test('Product keyword search works',async()=>{const r=await request('manager','GET','/products?keyword=QA');status(r,[200]);assert.ok(r.data.data.length>0);});
await test('Invalid pagination rejected',async()=>status(await request('manager','GET','/products?page=-1&limit=-5'),[400,422]));
await test('Unknown query rejected',async()=>status(await request('manager','GET','/products?notAField=true'),[400,422]));
await test('Rep cannot create product',async()=>status(await request('rep','POST','/products',{name:'Unauthorized',internalRef:'N',salesPrice:1}),[403]));
await test('Manager creates pharmacy',async()=>{const r=await request('manager','POST','/pharmacies',{name:'QA New Pharmacy',city:'Cairo',country:'Egypt',region:'QA Cairo',subRegion:'QA Nasr City'});status(r,[201]);pharmacyId=r.data.data.id;});
await test('Pharmacy update persists',async()=>{status(await request('manager','PATCH',`/pharmacies/${pharmacyId}`,{city:'Alexandria'}),[200]);assert.equal((await prisma.pharmacy.findUnique({where:{id:pharmacyId}})).city,'Alexandria');});
await test('Blank pharmacy rejected',async()=>status(await request('manager','POST','/pharmacies',{name:' ',city:' ',country:' ',region:' ',subRegion:' '}),[400,422]));
await test('Pharmacy search works',async()=>status(await request('manager','GET','/pharmacies?keyword=QA'),[200]));
await test('Manager creates doctor',async()=>{const r=await request('manager','POST','/doctors',{nameEN:'QA New Doctor',nameAR:'طبيب',email:'newdoctor@goldera.test',phone:'01000000001',grade:'A',specialty:'Cardiology',avgPatientsPerDay:10,subRegion:'QA Nasr City',accountName:'QA Clinic'});status(r,[201]);doctorId=r.data.data.id;});
await test('Doctor update persists',async()=>{status(await request('manager','PATCH',`/doctors/${doctorId}`,{nameEN:'QA Edited Doctor'}),[200]);assert.equal((await prisma.doctor.findUnique({where:{id:doctorId}})).nameEN,'QA Edited Doctor');});
await test('Empty doctor rejected',async()=>status(await request('manager','POST','/doctors',{}),[400,422]));
await test('Doctor search works',async()=>status(await request('manager','GET','/doctors?keyword=QA'),[200]));
await test('Manager creates rep',async()=>{const r=await request('manager','POST','/managers/users',{name:'QA Added Rep',email:`qa.added.${run}@goldera.test`,password:state.password,role:'MEDICAL_REP',dateOfBirth:'1995-01-01',dateOfRecruitment:'2026-01-01',subRegionId:f.subRegion.id,supervisorId:f.supervisor.id});status(r,[201]);userId=r.data.data.id;});
await test('Member update persists',async()=>{status(await request('manager','PUT',`/managers/users/${userId}`,{phone:'01000000002'}),[200]);assert.equal((await prisma.user.findUnique({where:{id:userId}})).phone,'01000000002');});
await test('Profile cannot elevate role',async()=>{const r=await request('rep','PATCH','/profiles',{role:'MANAGER',managerId:f.outsider.id});assert.ok([400,403,422].includes(r.status) || (r.status===200&&r.data.data.role==='MEDICAL_REP'),'Rep can promote own role');});
await prisma.user.update({where:{id:f.rep.id},data:{role:'MEDICAL_REP',managerId:f.manager.id}});
await test('Profile normal update hides password',async()=>{const r=await request('rep','PATCH','/profiles',{bio:'QA profile'});status(r,[200]);noSecrets(r.data);});
await test('Manager schedules rep visit',async()=>{const r=await request('manager','POST','/visits',{date:'2026-10-05',doctorId:f.doctor.id,medicalRepId:f.rep.id,time:'10:30',notes:'QA visit',visitType:'ROUTINE'});status(r,[201]);visitId=r.data.data.id;assert.equal((await prisma.visit.findUnique({where:{id:visitId}})).userId,f.rep.id);});
await test('Visit time update persists',async()=>{status(await request('rep','PATCH',`/visits/${visitId}`,{time:'11:45'}),[200]);assert.equal((await prisma.visit.findUnique({where:{id:visitId}})).time,'11:45');});
await test('Rep cannot edit another visit',async()=>status(await request('rep2','PATCH',`/visits/${visitId}`,{notes:'unauthorized'}),[403,404]));
await test('Unrelated manager cannot edit visit',async()=>status(await request('outsider','PATCH',`/visits/${visitId}`,{notes:'unauthorized'}),[403,404]));
await test('Supervisor visit scope cannot be overridden',async()=>{const other=await prisma.visit.create({data:{doctorId:f.doctor.id,userId:f.rep2.id,date:new Date('2026-10-05'),samples:[]}});const r=await request('supervisor','GET',`/visits/all?createdById=${f.rep2.id}`);status(r,[200,403]);assert.ok(r.status===403||!r.data.data.some(x=>x.id===other.id),'Outside-team visit visible');});
await test('Visit report saves topics and completes visit',async()=>{const r=await request('rep','POST','/visits/visit-reports',{visitId,duration:'30',rating:'4',visitPurpose:'Product discussion',discussedTopics:['Efficacy'],samplesProvided:['QA sample'],notes:'QA notes',doctorFeedback:'Positive'});status(r,[200,201]);assert.deepEqual(r.data.data.discussedTopics,['Efficacy']);assert.equal((await prisma.visit.findUnique({where:{id:visitId}})).status,'COMPLETED');});
await test('Duplicate visit report rejected',async()=>status(await request('rep','POST','/visits/visit-reports',{visitId,duration:'30',rating:'4',visitPurpose:'Test',discussedTopics:['Test']}),[400,409]));
await test('Rep creates pending plan',async()=>{const r=await request('rep','POST','/plans',{title:`QA Plan ${run}`,description:'QA Plan',type:'WEEKLY',status:'PENDING',startDate:'2026-10-05',endDate:'2026-10-11',objectives:['Visits'],targetVisits:1,doctorsWithDates:[{doctorId:f.doctor.id,visitDate:'2026-10-06'}]});status(r,[201]);planId=r.data.data.id;});
await test('Rep cannot approve own plan',async()=>status(await request('rep','PATCH',`/plans/${planId}`,{status:'APPROVED'}),[403]));
await prisma.plan.update({where:{id:planId},data:{status:'PENDING'}});
await prisma.visit.deleteMany({where:{planId}});
await test('Plan approval creates visits once concurrently',async()=>{const rs=await Promise.all([request('supervisor','PATCH',`/plans/${planId}`,{status:'APPROVED'}),request('supervisor','PATCH',`/plans/${planId}`,{status:'APPROVED'})]);assert.ok(rs.some(x=>x.status===200));assert.equal(await prisma.visit.count({where:{planId}}),1,'Concurrent approval duplicated plan visits');});
await test('Rep cannot create approved forecast',async()=>{const r=await request('rep','POST','/forecasts',{periodType:'monthly',periodDate:'2026-11-01',productForecasts:[{productId:f.product.id,quantity:10}],status:'APPROVED'});assert.ok([400,403].includes(r.status)||(r.status===201&&r.data.data.status!=='APPROVED'),'Rep can self-approve forecast');});
await test('Rep creates forecast',async()=>{const r=await request('rep','POST','/forecasts',{periodType:'monthly',periodDate:'2026-11-01',productForecasts:[{productId:f.product.id,quantity:10}],status:'PENDING'});status(r,[201]);forecastId=r.data.data.id;});
await test('Unrelated rep cannot read forecast',async()=>status(await request('rep2','GET',`/forecasts/${forecastId}`),[403,404]));
await test('Supervisor approves forecast consistently',async()=>{const r=await request('supervisor','PATCH',`/forecasts/${forecastId}`,{status:'APPROVED',supervisorFeedback:'Good'});status(r,[200]);assert.equal(r.data.data.isApproved,true);});
await test('Rep creates sample request',async()=>{const r=await request('rep','POST','/requests',{title:`QA Samples ${run}`,subject:'QA Samples',description:'QA request',type:'SAMPLE',urgency:'NORMAL',sampleData:[{productId:f.product.id,name:'QA Medicine',amount:2,quantity:2}],doctorIds:[f.doctor.id]});status(r,[201]);requestId=r.data.data.id;const v=await prisma.request.findUnique({where:{id:requestId},include:{doctors:true}});assert.equal(v.doctors[0].id,f.doctor.id);});
await test('Manager approves sample request',async()=>{const r=await request('manager','PATCH',`/requests/${requestId}`,{status:'APPROVED',response:'QA Approved'});status(r,[200]);assert.equal((await prisma.request.findUnique({where:{id:requestId}})).status,'APPROVED');});
await test('Duplicate request review rejected',async()=>status(await request('manager','PATCH',`/requests/${requestId}`,{status:'APPROVED'}),[400,409]));
await test('Negative sample amount rejected',async()=>status(await request('rep','POST','/requests',{title:'QA Bad Samples',subject:'Bad',description:'Bad',type:'SAMPLE',urgency:'NORMAL',sampleData:[{productId:f.product.id,name:'QA',amount:-1}]}),[400,422]));
await test('Concurrent leave approval increments once',async()=>{const leave=await prisma.request.create({data:{title:'QA Leave',subject:'Leave',description:'QA',type:'LEAVE',urgency:'NORMAL',userId:f.rep.id,leaveDaysCount:2,leaveStartDate:new Date('2026-11-01'),leaveEndDate:new Date('2026-11-02'),totalExpenseData:[],sampleData:[],pdfs:[]}});const before=await prisma.user.findUnique({where:{id:f.rep.id}});await Promise.all([request('manager','PATCH',`/requests/${leave.id}`,{status:'APPROVED'}),request('manager','PATCH',`/requests/${leave.id}`,{status:'APPROVED'})]);const after=await prisma.user.findUnique({where:{id:f.rep.id}});assert.equal(after.leaveDaysCountTotal-before.leaveDaysCountTotal,2,'Concurrent approval counted leave twice');});
await test('Manager creates coaching report',async()=>{const r=await request('manager','POST','/coaching-reports',{repId:f.rep.id,doctorId:f.doctor.id,visitDate:'2026-10-04',visitDuration:'30',visitLocation:'QA Clinic',performanceRating:4,visitPros:['Knowledge'],visitCons:['Timing'],recommendations:'Follow up',actionItems:['Training'],notes:'QA'});status(r,[201]);coachingId=r.data.data.id;});
await test('Rep accepts manager coaching',async()=>status(await request('rep','PATCH',`/coaching-reports/${coachingId}`,{accept:true}),[200]));
await test('Unrelated manager cannot coach rep',async()=>status(await request('outsider','POST','/coaching-reports',{repId:f.rep.id,doctorId:f.doctor.id,visitDate:'2026-10-04',visitDuration:'30',visitLocation:'QA',performanceRating:4,visitPros:[],visitCons:[],recommendations:'QA',actionItems:[]}),[403,404]));
await test('Manager creates appraisal',async()=>{const r=await request('manager','POST','/appraisals',{repId:f.rep.id,period:'2026-10-01',salesPerformance:4,customerRelationships:4,productKnowledge:4,complianceAndRegulations:4,teamworkAndCollaboration:4});status(r,[201]);appraisalId=r.data.data.id;});
await test('Rep acknowledges appraisal',async()=>status(await request('rep','PATCH',`/appraisals/${appraisalId}`,{accept:true,comment:'Reviewed'}),[200]));
await test('Other rep cannot acknowledge appraisal',async()=>status(await request('rep2','PATCH',`/appraisals/${appraisalId}`,{accept:true}),[403]));
await test('Unrelated manager cannot appraise rep',async()=>status(await request('outsider','POST','/appraisals',{repId:f.rep.id,period:'2026-10-01'}),[403,404]));
await test('Deactivated login and token blocked',async()=>{await prisma.user.update({where:{id:f.rep2.id},data:{isActive:false}});status(await request('rep2','GET','/profiles'),[403]);status(await request(null,'POST','/auth/login',{email:f.rep2.email,password:state.password}),[403]);await prisma.user.update({where:{id:f.rep2.id},data:{isActive:true}});});
for(const [path,id,model] of [['/products',productId,'products'],['/pharmacies',pharmacyId,'pharmacy'],['/doctors',doctorId,'doctor'],['/managers/users',userId,'user']]) await test(`Delete and confirm ${model}`,async()=>{status(await request('manager','DELETE',`${path}/${id}`),[200,204]);assert.equal(await prisma[model].findUnique({where:{id}}),null);status(await request('manager','DELETE',`${path}/${id}`),[404]);});
fs.writeFileSync(`${root}/audit/2026-10-04/full-system/${run}-api.json`,JSON.stringify({schema:state.schema,total:results.length,passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results},null,2));
console.log(JSON.stringify({total:results.length,passed:results.filter(x=>x.pass).length,failures:results.filter(x=>!x.pass)},null,2));
await prisma.$disconnect();
