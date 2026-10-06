// Real API + Prisma checks against a fresh, in-memory PostgreSQL-compatible database.
// Run: node audit/2026-10-06/workflows.mjs [--serve]
// QA prerequisites already available locally: @electric-sql/pglite and pglite-socket.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(`${root}/goldBack/package.json`);
const { PGlite } = require('@electric-sql/pglite');
const { PGLiteSocketServer } = require('@electric-sql/pglite-socket');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const schema = execFileSync(`${root}/goldBack/node_modules/.bin/prisma`, ['migrate', 'diff', '--from-empty', '--to-schema', `${root}/goldBack/prisma/schema.prisma`, '--script'], { encoding: 'utf8', cwd: `${root}/goldBack` });
const db = await PGlite.create();
if (!schema.includes("CREATE TABLE")) throw new Error("Schema generation produced no SQL");
await db.exec(schema.slice(schema.indexOf("-- CreateSchema")));
const socket = new PGLiteSocketServer({ db, port: 55439, host: '127.0.0.1' });
await socket.start();
process.env.DATABASE_URL = 'postgresql://qa:qa@127.0.0.1:55439/qa';
process.env.JWT_ACCESS_SECRET_KEY = 'local-workflow-qa-secret';
process.env.JWT_ACCESS_EXPIRE_TIME = '1d';
process.env.NODE_ENV = 'development';
global.prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 1 }) });
const prisma = global.prisma;
const password = 'WorkflowQA!2026';
const hash = await bcrypt.hash(password, 4);
const user = (name, role, extra = {}) => prisma.user.create({ data: { name, role, email: `qa.workflow-${name.toLowerCase()}@goldera.test`, password: hash, dateOfBirth: new Date('1995-01-01'), certificates: [], ...extra } });
const manager = await user('Manager', 'MANAGER');
const outsider = await user('Outsider', 'MANAGER');
const supervisor = await user('Supervisor', 'SUPERVISOR', { managerId: manager.id });
const rep = await user('Rep', 'MEDICAL_REP', { managerId: manager.id, supervisorId: supervisor.id });
const rep2 = await user('Rep2', 'MEDICAL_REP', { managerId: outsider.id });
const docs = [];
for (let i = 1; i <= 12; i++) docs.push(await prisma.doctor.create({ data: { nameEN: `QA Doctor ${i}`, nameAR: `طبيب تجريبي ${i}`, subRegion: 'الرياض', accountName: 'QA Clinic', grade: 'A', phone: '01000000000', specialty: 'Cardiology' } }));
const app = express();
app.use(express.json());
const { default: mount } = await import(`${root}/goldBack/routes/index.js`);
const { default: errorMiddleware } = await import(`${root}/goldBack/middlewares/error.middleware.js`);
mount(app);
app.use(errorMiddleware);
const server = app.listen(5052, '127.0.0.1');
const actors = { manager, outsider, supervisor, rep, rep2 };
async function request(actor, method, endpoint, body) {
 const token = jwt.sign({ userId: actors[actor].id }, process.env.JWT_ACCESS_SECRET_KEY);
 const response = await fetch(`http://127.0.0.1:5052/api${endpoint}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, ...(body ? { body: JSON.stringify(body) } : {}) });
 return { status: response.status, body: await response.json() };
}
const results = [];
async function check(name, fn) { try { await fn(); results.push({ name, passed: true }); console.log(`PASS ${name}`); } catch (error) { results.push({ name, passed: false, error: error.message }); console.log(`FAIL ${name}: ${error.message}`); } }
const plan = (count, extra = {}) => ({ title: `QA ${count} visits ${Date.now()}`, type: 'WEEKLY', description: 'QA visit limit', startDate: '2026-10-06', endDate: '2026-10-12', targetVisits: 10, objectives: ['QA'], doctorsWithDates: docs.slice(0, count).map(doc => ({ doctorId: doc.id, visitDate: '2026-10-07' })), ...extra });
let approvedPlan;
await check('10 visits accepted and stored', async () => { const response = await request('rep', 'POST', '/plans', plan(10)); assert.equal(response.status, 201, JSON.stringify(response.body)); approvedPlan = response.body.data; assert.equal(approvedPlan.doctors.length, 10); });
for (const count of [11, 12]) await check(`${count} visits rejected at a limit of 10`, async () => { const response = await request('rep', 'POST', '/plans', plan(count)); assert.equal(response.status, 400); assert.match(response.body.message, /at most 10/); });
await check('Non-integer target rejected', async () => assert.equal((await request('rep', 'POST', '/plans', plan(1, { targetVisits: 1.5 }))).status, 400));
await check('Repeated doctor/date rejected', async () => { const payload = plan(1); payload.doctorsWithDates.push(payload.doctorsWithDates[0]); assert.equal((await request('rep', 'POST', '/plans', payload)).status, 400); });
await check('Same doctor on different dates preserves both visits', async () => { const payload = plan(1); payload.doctorsWithDates.push({ doctorId: docs[0].id, visitDate: '2026-10-08' }); const response = await request('rep', 'POST', '/plans', payload); assert.equal(response.status, 201); assert.equal(response.body.data.doctors.length, 2); assert.equal(response.body.data.targetDoctors, 1); });
await check('Approval creates exactly 10 linked visits', async () => { const response = await request('manager', 'PATCH', `/plans/${approvedPlan.id}`, { status: 'APPROVED' }); assert.equal(response.status, 200, JSON.stringify(response.body)); assert.equal(await prisma.visit.count({ where: { planId: approvedPlan.id } }), 10); });
await check('Legacy over-limit plan cannot be approved', async () => { const legacy = await prisma.plan.create({ data: { title: 'QA legacy excess', type: 'WEEKLY', description: 'QA', startDate: new Date('2026-10-06'), endDate: new Date('2026-10-12'), targetVisits: 1, targetDoctors: 2, objectives: [], createdById: rep.id, doctors: docs.slice(0, 2).map(doc => ({ id: doc.id, visitDate: '2026-10-07' })) } }); const response = await request('manager', 'PATCH', `/plans/${legacy.id}`, { status: 'APPROVED' }); assert.equal(response.status, 409); assert.equal(await prisma.visit.count({ where: { planId: legacy.id } }), 0); });
await check('Doctor edit persists and optional number can clear', async () => { const response = await request('manager', 'PATCH', `/doctors/${docs[11].id}`, { nameEN: 'QA Edited Doctor', avgPatientsPerDay: 25 }); assert.equal(response.status, 200); assert.equal((await prisma.doctor.findUnique({ where: { id: docs[11].id } })).avgPatientsPerDay, 25); assert.equal((await request('manager', 'PATCH', `/doctors/${docs[11].id}`, { avgPatientsPerDay: null })).status, 200); });
await check('Doctor deletion persists for unused records', async () => { assert.equal((await request('manager', 'DELETE', `/doctors/${docs[11].id}`)).status, 200); assert.equal(await prisma.doctor.findUnique({ where: { id: docs[11].id } }), null); });
await check('Linked doctor deletion returns conflict', async () => { const response = await request('manager', 'DELETE', `/doctors/${docs[0].id}`); assert.equal(response.status, 409); assert.ok(await prisma.doctor.findUnique({ where: { id: docs[0].id } })); });
await check('Rep cannot edit/delete master data', async () => { assert.equal((await request('rep', 'PATCH', `/doctors/${docs[1].id}`, { nameEN: 'Tamper' })).status, 403); assert.equal((await request('rep', 'DELETE', `/doctors/${docs[1].id}`)).status, 403); });
const pharmacy = await prisma.pharmacy.create({ data: { name: 'QA Pharmacy', city: 'Riyadh', country: 'Saudi Arabia', region: 'الوسطى', subRegion: 'الرياض' } });
await check('Pharmacy edit and deletion persist', async () => { assert.equal((await request('manager', 'PATCH', `/pharmacies/${pharmacy.id}`, { name: 'QA Edited Pharmacy', city: 'Jeddah' })).status, 200); assert.equal((await prisma.pharmacy.findUnique({ where: { id: pharmacy.id } })).city, 'Jeddah'); assert.equal((await request('manager', 'DELETE', `/pharmacies/${pharmacy.id}`)).status, 200); assert.equal(await prisma.pharmacy.findUnique({ where: { id: pharmacy.id } }), null); });
const linkedPharmacy = await prisma.pharmacy.create({ data: { name: 'QA Sales Pharmacy', city: 'Riyadh', country: 'Saudi Arabia', region: 'الوسطى', subRegion: 'الرياض' } });
const product = await prisma.products.create({ data: { name: 'QA Medicine', internalRef: 'QA001', salesPrice: 100 } });
const sale = await prisma.sales.create({ data: { sheetName: 'QA', customer: linkedPharmacy.name, order: 'QA001', productId: product.id, orderDate: new Date('2026-10-06'), qtyOrdered: 1, untaxedTotal: 100 } });
await check('Pharmacy rename preserves sales linkage', async () => { const response = await request('manager', 'PATCH', `/pharmacies/${linkedPharmacy.id}`, { name: 'QA Renamed Sales Pharmacy' }); assert.equal(response.status, 200, JSON.stringify(response.body)); assert.equal((await prisma.sales.findUnique({ where: { id: sale.id } })).customer, 'QA Renamed Sales Pharmacy'); });
await check('Linked pharmacy deletion blocked', async () => assert.equal((await request('manager', 'DELETE', `/pharmacies/${linkedPharmacy.id}`)).status, 409));
fs.writeFileSync(`${root}/audit/2026-10-06/workflows-results.json`, JSON.stringify({ passed: results.filter(result => result.passed).length, total: results.length, results }, null, 2));
if (process.argv.includes('--serve') && results.every(result => result.passed)) {
 console.log('Disposable QA API available on 5052. Only synthetic users/data; credentials defined in this QA script.');
 const close = async () => { server.close(); await prisma.$disconnect(); await socket.stop(); await db.close(); process.exit(0); };
 process.on('SIGINT', close); process.on('SIGTERM', close);
} else { server.close(); await prisma.$disconnect(); await socket.stop(); await db.close(); process.exitCode = results.some(result => !result.passed) ? 1 : 0; }
