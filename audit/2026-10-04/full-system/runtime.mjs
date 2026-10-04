import fs from 'node:fs';
import { createRequire } from 'node:module';
const root = '/Users/marwan/Documents/Golderapharm';
const require = createRequire(`${root}/goldBack/package.json`);
require('dotenv').config({ path: `${root}/goldBack/.env`, quiet: true });
const state = JSON.parse(fs.readFileSync('/private/tmp/goldera-full-qa.json', 'utf8'));
if (!/^goldera_qa_20261004_[a-f0-9]{10}$/.test(state.schema) || new URL(state.databaseUrl).searchParams.get("schema") !== state.schema) throw new Error("Refusing to run outside the disposable QA schema");
process.env.DATABASE_URL = state.databaseUrl;
process.env.PORT = '5051';
process.env.CLIENT_URL = 'http://localhost:3002';
process.env.NODE_ENV = 'development';
if (process.argv[2] === 'seed') {
  const { prisma } = await import(`${root}/goldBack/config/db.js`);
  const password = 'QaDisposable!2026';
  const hash = await require('bcrypt').hash(password, 10);
  const createUser = (name, role, extra = {}) => prisma.user.create({data:{ name, role, email:`qa.${name.toLowerCase()}@goldera.test`, password: hash, dateOfBirth:new Date('1995-01-01'), certificates:[], ...extra }});
  const manager = await createUser('Manager', 'MANAGER');
  const outsider = await createUser('Outsider', 'MANAGER');
  const supervisor = await createUser('Supervisor', 'SUPERVISOR', {managerId:manager.id});
  const region = await prisma.region.create({data:{name:'QA Cairo', country:'Egypt', supervisorId:supervisor.id}});
  const subRegion = await prisma.subRegion.create({data:{name:'QA Nasr City',regionId:region.id}});
  const rep = await createUser('Rep', 'MEDICAL_REP', {managerId:manager.id,supervisorId:supervisor.id,subRegionId:subRegion.id});
  const rep2 = await createUser('Rep2', 'MEDICAL_REP', {managerId:outsider.id});
  const account = await prisma.accounts.create({data:{name:'QA Clinic',subRegionId:subRegion.id}});
  const doctor = await prisma.doctor.create({data:{nameEN:'QA Doctor',nameAR:'طبيب اختبار',phone:'01000000000',email:'doctor@goldera.test',specialty:'Cardiology',grade:'A',subRegion:subRegion.name,accountName:account.name,accountsId:account.id,avgPatientsPerDay:30,latitude:30.05,longitude:31.3}});
  const product = await prisma.products.create({data:{name:'QA Medicine',internalRef:'QA001',salesPrice:100}});
  const pharmacy = await prisma.pharmacy.create({data:{name:'QA Pharmacy',city:'Cairo',country:'Egypt',region:region.name,subRegion:subRegion.name}});
  const safe = Object.fromEntries(Object.entries({manager,outsider,supervisor,rep,rep2,region,subRegion,account,doctor,product,pharmacy}).map(([k,v])=>[k,{id:v.id,email:v.email,name:v.name}]));
  fs.writeFileSync('/private/tmp/goldera-full-qa.json',JSON.stringify({...state,fixtures:safe,password}),{mode:0o600});
  console.log(JSON.stringify({seeded:true,schema:state.schema,users:5}));
  await prisma.$disconnect();
} else {
  await import(`${root}/goldBack/server.js`);
}
