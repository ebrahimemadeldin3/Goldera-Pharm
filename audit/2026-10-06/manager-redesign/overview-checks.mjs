import assert from 'node:assert/strict';
import { buildManagerOverview } from '../../../goldBack/controllers/manager-overview.controller.js';
import { APPRAISAL_FIELDS } from '../../../goldBack/utils/dashboard-sections.js';

export function faultedOverviewDb(db) {
 return new Proxy(db, { get(target, key) {
  if (key === 'coachingReport') return new Proxy(target.coachingReport, { get() { return async () => { throw Object.assign(new Error('QA coaching source unavailable'), { code: 'QA_SOURCE_FAILURE' }); }; } });
  if (key === '$transaction') return (callback, options) => target.$transaction(tx => callback(faultedOverviewDb(tx)), options);
  const value = Reflect.get(target, key, target); return typeof value === 'function' ? value.bind(target) : value;
 } });
}

export async function runOverviewChecks({ prisma, actors, request, check, user }) {
  const central = await prisma.region.create({ data: { name: 'Central Region', country: 'Saudi Arabia', supervisorId: actors.supervisor.id } });
  const western = await prisma.region.create({ data: { name: 'Western Region', country: 'Saudi Arabia' } });
  const riyadh = await prisma.subRegion.create({ data: { name: 'Riyadh 1', regionId: central.id } });
  const jeddah = await prisma.subRegion.create({ data: { name: 'Jeddah 1', regionId: western.id } });
  await prisma.user.update({ where: { id: actors.rep.id }, data: { subRegionId: riyadh.id } });
  await prisma.doctor.updateMany({ data: { subRegion: 'Riyadh 1' } });
  await prisma.pharmacy.updateMany({ data: { region: central.name, subRegion: riyadh.name } });
  const westRep = await user('WestRep', 'MEDICAL_REP', { managerId: actors.manager.id, subRegionId: jeddah.id });
  const westDoctor = await prisma.doctor.create({ data: { nameAR: 'طبيب جدة', subRegion: 'Jeddah 1', specialty: 'Cardiology', accountName: 'QA Western Clinic' } });
  const eastDoctor = await prisma.doctor.findFirst({ where: { subRegion: 'Riyadh 1' } });
  const linked = await prisma.visit.findMany({ where: { userId: actors.rep.id }, orderBy: { id: 'asc' }, take: 4 });
  for (const visit of linked.slice(0, 3)) await prisma.visit.update({ where: { id: visit.id }, data: { status: 'COMPLETED' } });
  await prisma.visit.update({ where: { id: linked[3].id }, data: { status: 'CANCELLED' } });
  for (let i = 0; i < 2; i++) await prisma.visit.create({ data: { doctorId: eastDoctor.id, userId: actors.rep.id, date: new Date('2026-10-06'), samples: [], status: 'SCHEDULED' } });
  await prisma.visit.create({ data: { doctorId: westDoctor.id, userId: westRep.id, date: new Date('2026-10-06'), samples: [], status: 'COMPLETED' } });
  await prisma.visit.create({ data: { doctorId: westDoctor.id, userId: actors.rep2.id, date: new Date('2026-10-06'), samples: [], status: 'COMPLETED' } });
  const westPharmacy = await prisma.pharmacy.create({ data: { name: 'QA Western Pharmacy', city: 'Jeddah', country: 'Saudi Arabia', region: western.name, subRegion: jeddah.name } });
  const product = await prisma.products.findFirst();
  await prisma.sales.create({ data: { sheetName: 'QA', customer: westPharmacy.name, order: 'QA-West', orderDate: new Date('2026-10-06'), productId: product.id, qtyOrdered: 2, untaxedTotal: 50 } });
  for (const rating of [2, 5]) await prisma.coachingReport.create({ data: { repId: actors.rep.id, doctorId: eastDoctor.id, createdById: actors.supervisor.id, visitDate: new Date('2026-10-06'), visitDuration: '30', visitLocation: 'QA Clinic', performanceRating: rating, visitPros: [], visitCons: [], recommendations: 'QA', actionItems: [], repAccepted: rating === 5 } });
  await prisma.appraisal.create({ data: { repId: actors.rep.id, managerId: actors.manager.id, period: new Date('2026-10-06'), salesPerformance: 80, customerRelationships: 80, productKnowledge: 80, complianceAndRegulations: 80, teamworkAndCollaboration: 80, ...Object.fromEntries(APPRAISAL_FIELDS.map(field => [field, 80])) } });
  await prisma.appraisal.create({ data: { repId: actors.rep.id, managerId: actors.manager.id, period: new Date('2026-10-06'), salesPerformance: 80, customerRelationships: 80, productKnowledge: 80, complianceAndRegulations: 80, teamworkAndCollaboration: 80 } });
  const createRequest = (title, status, date) => prisma.request.create({ data: { title, status, createdAt: new Date(date), type: 'EXPENSE', userId: actors.rep.id, urgency: 'NORMAL', subject: 'QA', description: 'QA', totalExpenseData: [], sampleData: [], pdfs: [] } });
  await createRequest('QA Current pending', 'PENDING', '2026-10-06');
  await createRequest('QA Approved', 'APPROVED', '2026-10-06');
  await createRequest('QA Earlier pending', 'PENDING', '2026-09-06');
  const endpoint = '/dashboard/managers/overview?from=2026-10-01&to=2026-10-31';
  let overview;
  await check('Overview: every section loads from real database queries', async () => { const response = await request('manager', 'GET', endpoint); assert.equal(response.status, 200, JSON.stringify(response.body)); overview = response.body.data; for (const [source, section] of Object.entries(overview.sections)) assert.equal(section.status, 'ready', `${source}: ${JSON.stringify(section.error)}`); });
  await check('Overview: visits reconcile and exclude another manager', async () => { const v = overview.sections.visits.data; assert.equal(v.total, 13); assert.equal(v.completed, 4); assert.equal(v.scheduled, 8); assert.equal(v.cancelled, 1); assert.equal(v.statuses.reduce((sum, row) => sum + row.count, 0), v.total); assert.equal(v.trend.reduce((sum, row) => sum + row.total, 0), v.total); assert.equal(v.byRep.reduce((sum, row) => sum + row.count, 0), v.total); assert.equal(v.byTerritory.reduce((sum, row) => sum + row.total, 0), v.total); });
  await check('Overview: sales sum and trends use ledger amounts', async () => { const sales = overview.sections.sales.data; assert.equal(sales.total, 150); assert.equal(sales.records, 2); assert.equal(sales.trend.reduce((sum, row) => sum + row.amount, 0), 150); });
  await check('Overview: real territory filters apply to visits and sales', async () => { const response = await request('manager', 'GET', `${endpoint}&regionId=${western.id}&territoryId=${jeddah.id}`); assert.equal(response.status, 200); assert.equal(response.body.data.sections.visits.data.total, 1); assert.equal(response.body.data.sections.sales.data.total, 50); assert.equal(response.body.data.sections.directory.data.doctors, 1); });
  await check('Overview: representative filter applies without inventing sales ownership', async () => { const response = await request('manager', 'GET', `${endpoint}&repId=${westRep.id}`); assert.equal(response.status, 200); assert.equal(response.body.data.sections.visits.data.total, 1); assert.equal(response.body.data.sections.team.data.reps, 1); assert.equal(response.body.data.sections.directory.data.doctors, 1); assert.equal(response.body.data.sections.sales.data.total, 150); assert.equal(response.body.data.sections.sales.data.representativeFilterApplied, false); });
  await check('Overview: coaching and complete appraisal scores use their real scales', async () => { assert.equal(overview.sections.coaching.data.average, 3.5); assert.equal(overview.sections.appraisals.data.average, 80); assert.equal(overview.sections.appraisals.data.excluded, 1); assert.equal(overview.sections.appraisals.data.distribution[0].count, 1); });
  await check('Overview: current approvals are distinct from dated request history', async () => { const workflow = overview.sections.workflow.data; assert.equal(workflow.pendingRequests, 2); assert.equal(workflow.requests.reduce((sum, row) => sum + row.count, 0), 2); assert.equal(workflow.target, 10); assert.equal(workflow.completed, 3); assert.equal(workflow.achievement, 30); });
  await check('Overview: empty date range gives honest zeros and null percentages', async () => { const response = await request('manager', 'GET', '/dashboard/managers/overview?from=2025-01-01&to=2025-01-31'); const v = response.body.data.sections.visits.data; assert.equal(v.total, 0); assert.equal(v.completionRate, null); assert.equal(response.body.data.sections.sales.data.records, 0); assert.equal(response.body.data.sections.coaching.data.average, null); });
  await check('Overview: Saudi midnight boundaries include the correct day', async () => { await prisma.visit.create({ data: { doctorId: eastDoctor.id, userId: actors.rep.id, date: new Date('2026-10-05T21:30:00Z'), samples: [], status: 'COMPLETED' } }); const response = await request('manager', 'GET', '/dashboard/managers/overview?from=2026-10-06&to=2026-10-06'); assert.ok(response.body.data.sections.visits.data.recent.some(row => row.date.startsWith('2026-10-05T21:30'))); });
  await check('Overview: invalid range, impossible dates and mismatched geography reject', async () => { for (const suffix of ['?from=2026-10-31&to=2026-10-01', '?from=2026-02-30&to=2026-03-01', `?regionId=${central.id}&territoryId=${jeddah.id}`]) assert.equal((await request('manager', 'GET', `/dashboard/managers/overview${suffix}`)).status, 400); });
  await check('Overview: other representatives and roles cannot bypass scope', async () => { assert.equal((await request('manager', 'GET', `${endpoint}&repId=${actors.rep2.id}`)).status, 403); assert.equal((await request('rep', 'GET', endpoint)).status, 403); assert.equal((await request('supervisor', 'GET', endpoint)).status, 403); });
  await check('Overview: recorded visits remain visible across current representative assignments', async () => { await prisma.visit.create({ data: { doctorId: eastDoctor.id, userId: westRep.id, date: new Date('2026-10-06'), samples: [], status: 'COMPLETED' } }); const response = await request('manager', 'GET', `${endpoint}&repId=${westRep.id}&regionId=${central.id}`); assert.equal(response.status, 200); assert.equal(response.body.data.sections.visits.data.total, 1); assert.equal(response.body.data.sections.team.data.reps, 0); assert.ok(response.body.data.sections.team.data.performanceMembers.some(member => member.id === westRep.id && !member.inCurrentScope)); });
  await check('Overview: a failed coaching source does not discard successful sources', async () => { const failing = faultedOverviewDb(prisma); const result = await buildManagerOverview(failing, actors.manager, { from: '2026-10-01', to: '2026-10-31' }); assert.equal(result.sections.coaching.status, 'error'); assert.equal(result.sections.coaching.data, null); assert.equal(result.sections.coaching.error.code, 'QA_SOURCE_FAILURE'); assert.equal(result.sections.appraisals.status, 'ready'); assert.equal(result.sections.visits.status, 'ready'); const recovered = await buildManagerOverview(prisma, actors.manager, { from: '2026-10-01', to: '2026-10-31' }); assert.equal(recovered.sections.coaching.status, 'ready'); });
}
