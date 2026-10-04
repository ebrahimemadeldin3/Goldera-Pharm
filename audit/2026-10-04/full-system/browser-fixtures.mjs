import fs from 'node:fs';
import {createRequire} from 'node:module';
const root='/Users/marwan/Documents/Golderapharm';const require=createRequire(`${root}/goldBack/package.json`);require('dotenv').config({path:`${root}/goldBack/.env`,quiet:true});
const state=JSON.parse(fs.readFileSync('/private/tmp/goldera-full-qa.json','utf8'));process.env.DATABASE_URL=state.databaseUrl;const {prisma}=await import(`${root}/goldBack/config/db.js`);
if (!/^goldera_qa_20261004_[a-f0-9]{10}$/.test(state.schema) || new URL(state.databaseUrl).searchParams.get("schema") !== state.schema) throw new Error("Refusing to run outside the disposable QA schema");
const visit=await prisma.visit.create({data:{doctorId:state.fixtures.doctor.id,userId:state.fixtures.rep.id,date:new Date(),time:'10:00',samples:[],notes:'QA Browser visit'}});
fs.writeFileSync(`${root}/audit/2026-10-04/full-system/browser-fixtures.json`,JSON.stringify({visitId:visit.id}));console.log(JSON.stringify({visitId:visit.id}));await prisma.$disconnect();
