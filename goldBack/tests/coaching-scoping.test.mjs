import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addCoachingReport } from '../controllers/coaching-reports.controller.js';
import { getAllDoctors } from '../controllers/doctor.controller.js';
import { prisma } from '../config/db.js';

test('addCoachingReport succeeds when doctor is assigned to rep territory', async () => {
  const origFindUniqueUser = prisma.user.findUnique;
  const origFindUniqueDoc = prisma.doctor.findUnique;
  const origCreateReport = prisma.coachingReport.create;

  try {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'rep-1') {
        return {
          id: 'rep-1',
          managerId: 'mgr-1',
          subRegion: { name: 'Riyadh Central' },
          subRegionId: 'sub-riyadh',
        };
      }
      return null;
    };

    prisma.doctor.findUnique = async ({ where }) => {
      if (where.id === 'doc-valid') {
        return {
          id: 'doc-valid',
          subRegion: 'Riyadh Central',
          accounts: { subRegion: { name: 'Riyadh Central' } },
        };
      }
      return null;
    };

    let createdData = null;
    prisma.coachingReport.create = async ({ data }) => {
      createdData = data;
      return { id: 'report-1', ...data };
    };

    const req = {
      user: { id: 'mgr-1', role: 'MANAGER' },
      body: {
        repId: 'rep-1',
        doctorId: 'doc-valid',
        visitDate: '2026-10-15T09:00:00.000Z',
        visitDuration: '45 mins',
        visitLocation: 'King Fahad Hospital',
        performanceRating: 4,
        visitPros: 'Great engagement with doctor',
        visitCons: 'Time management',
        recommendations: 'Follow up on sample trial',
        actionItems: 'Send brochures',
      },
    };

    let responseStatus = null;
    let responseBody = null;
    const res = {
      status(code) {
        responseStatus = code;
        return this;
      },
      json(payload) {
        responseBody = payload;
        return this;
      },
    };

    await addCoachingReport(req, res, () => {});

    assert.equal(responseStatus, 201);
    assert.equal(responseBody.status, 'success');
    assert.equal(createdData.repId, 'rep-1');
    assert.equal(createdData.doctorId, 'doc-valid');
  } finally {
    prisma.user.findUnique = origFindUniqueUser;
    prisma.doctor.findUnique = origFindUniqueDoc;
    prisma.coachingReport.create = origCreateReport;
  }
});

test('addCoachingReport rejects doctor from an outside territory', async () => {
  const origFindUniqueUser = prisma.user.findUnique;
  const origFindUniqueDoc = prisma.doctor.findUnique;

  try {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'rep-1') {
        return {
          id: 'rep-1',
          managerId: 'mgr-1',
          subRegion: { name: 'Riyadh Central' },
          subRegionId: 'sub-riyadh',
        };
      }
      return null;
    };

    prisma.doctor.findUnique = async ({ where }) => {
      if (where.id === 'doc-outside') {
        return {
          id: 'doc-outside',
          subRegion: 'Jeddah North',
          accounts: { subRegion: { name: 'Jeddah North' } },
        };
      }
      return null;
    };

    const req = {
      user: { id: 'mgr-1', role: 'MANAGER' },
      body: {
        repId: 'rep-1',
        doctorId: 'doc-outside',
        visitDate: '2026-10-15T09:00:00.000Z',
        visitDuration: '45 mins',
        visitLocation: 'Jeddah Clinic',
        performanceRating: 4,
      },
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };
    const res = {
      status() { return this; },
      json() { return this; },
    };

    await addCoachingReport(req, res, next);

    assert.ok(nextError);
    assert.equal(nextError.statusCode, 400);
    assert.match(nextError.message, /not assigned to the selected representative/i);
  } finally {
    prisma.user.findUnique = origFindUniqueUser;
    prisma.doctor.findUnique = origFindUniqueDoc;
  }
});

test('addCoachingReport rejects rep outside managed scope', async () => {
  const origFindUniqueUser = prisma.user.findUnique;

  try {
    prisma.user.findUnique = async () => ({
      id: 'rep-unmanaged',
      managerId: 'mgr-different',
    });

    const req = {
      user: { id: 'mgr-1', role: 'MANAGER' },
      body: { repId: 'rep-unmanaged', doctorId: 'doc-1' },
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };
    const res = {
      status() { return this; },
      json() { return this; },
    };

    await addCoachingReport(req, res, next);

    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
  } finally {
    prisma.user.findUnique = origFindUniqueUser;
  }
});

test('getAllDoctors filters by rep territory when repId query is passed', async () => {
  const origFindUniqueUser = prisma.user.findUnique;
  const origFindManyDoc = prisma.doctor.findMany;

  try {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'rep-1') {
        return {
          id: 'rep-1',
          subRegion: { name: 'Dammam' },
        };
      }
      return null;
    };

    let capturedWhere = null;
    prisma.doctor.findMany = async ({ where }) => {
      capturedWhere = where;
      return [{ id: 'doc-dammam', nameEN: 'Dr. Dammam', subRegion: 'Dammam' }];
    };

    const req = {
      query: { repId: 'rep-1', paginate: 'false' },
    };
    let resBody = null;
    const res = {
      status() { return this; },
      json(payload) {
        resBody = payload;
        return this;
      },
    };

    await getAllDoctors(req, res, () => {});

    assert.ok(capturedWhere);
    assert.ok(capturedWhere.OR);
    assert.deepEqual(capturedWhere.OR, [
      { subRegion: 'Dammam' },
      { area: 'Dammam' },
      { accounts: { subRegion: { name: 'Dammam' } } },
    ]);
    assert.equal(resBody.data.length, 1);
    assert.equal(resBody.data[0].id, 'doc-dammam');
  } finally {
    prisma.user.findUnique = origFindUniqueUser;
    prisma.doctor.findMany = origFindManyDoc;
  }
});
