import assert from 'node:assert/strict';
import { test } from 'node:test';
import express from 'express';
import notificationRouter from '../routes/notification.route.js';
import { prisma } from '../config/db.js';

test('Manager notifications include submitted forecast, acknowledged appraisal, and coaching response', async () => {
  const origFindManyReq = prisma.request.findMany;
  const origFindManyPlan = prisma.plan.findMany;
  const origFindManyFc = prisma.forecast.findMany;
  const origFindManyAppr = prisma.appraisal.findMany;
  const origFindManyCoach = prisma.coachingReport.findMany;

  try {
    const fixedDate = new Date('2026-10-11T12:00:00.000Z');

    prisma.request.findMany = async () => [];
    prisma.plan.findMany = async () => [];
    prisma.forecast.findMany = async () => [
      {
        id: 'fc-101',
        periodType: 'Monthly',
        periodDate: fixedDate,
        status: 'PENDING',
        supervisorFeedback: null,
        rep: { name: 'Ali Rep' },
        updatedAt: fixedDate,
      },
    ];
    prisma.appraisal.findMany = async () => [
      {
        id: 'appr-201',
        acknowledged: true,
        acknowledgementComment: 'Received goals.',
        feedbackComments: 'Great work',
        rep: { name: 'Ali Rep' },
        updatedAt: fixedDate,
      },
    ];
    prisma.coachingReport.findMany = async () => [
      {
        id: 'coach-301',
        repAccepted: true,
        repComment: 'Agreed on coaching plan.',
        recommendations: 'Follow up on clinics',
        rep: { name: 'Ali Rep' },
        updatedAt: fixedDate,
      },
    ];

    const app = express();
    app.use((req, res, next) => {
      req.user = { id: 'mgr-1', role: 'MANAGER', subRegions: [{ id: 'sub-1' }] };
      next();
    });
    app.use('/notifications', notificationRouter);

    let resBody = null;
    let resStatus = 200;
    const req = {
      user: { id: 'mgr-1', role: 'MANAGER', subRegions: [{ id: 'sub-1' }] },
    };
    const res = {
      json(payload) {
        resBody = payload;
        return this;
      },
      status(code) {
        resStatus = code;
        return this;
      },
    };

    // Simulate route invocation by testing the route middleware directly
    const routeHandler = notificationRouter.stack.find((layer) => layer.route)?.route.stack[0].handle;

    await routeHandler(req, res, () => {});

    assert.equal(resStatus, 200);
    assert.equal(resBody.status, 'success');
    assert.equal(resBody.userId, 'mgr-1');

    const notifs = resBody.data;
    assert.equal(notifs.length, 3);

    const fcNotif = notifs.find((n) => n.id.startsWith('forecast:fc-101'));
    assert.ok(fcNotif);
    assert.equal(fcNotif.title, 'Forecast awaiting review');
    assert.equal(fcNotif.href, '/manager/forecast');
    assert.match(fcNotif.message, /Ali Rep.*forecast submitted for review/);
    assert.equal(fcNotif.unread, true);

    const apprNotif = notifs.find((n) => n.id.startsWith('appraisal:appr-201'));
    assert.ok(apprNotif);
    assert.equal(apprNotif.title, 'Appraisal acknowledged');
    assert.equal(apprNotif.href, '/manager/appraisal');
    assert.match(apprNotif.message, /Ali Rep acknowledged appraisal.*Received goals/);

    const coachNotif = notifs.find((n) => n.id.startsWith('coaching:coach-301'));
    assert.ok(coachNotif);
    assert.equal(coachNotif.title, 'Coaching review responded');
    assert.equal(coachNotif.href, '/manager/coaching');
    assert.match(coachNotif.message, /Ali Rep responded.*Agreed on coaching plan/);

    // Idempotency: exact same record generates deterministic, identical ID
    assert.equal(fcNotif.id, `forecast:fc-101:${fixedDate.toISOString()}`);
    assert.equal(apprNotif.id, `appraisal:appr-201:${fixedDate.toISOString()}`);
    assert.equal(coachNotif.id, `coaching:coach-301:${fixedDate.toISOString()}`);
  } finally {
    prisma.request.findMany = origFindManyReq;
    prisma.plan.findMany = origFindManyPlan;
    prisma.forecast.findMany = origFindManyFc;
    prisma.appraisal.findMany = origFindManyAppr;
    prisma.coachingReport.findMany = origFindManyCoach;
  }
});

test('Medical Rep notifications route to rep destinations', async () => {
  const origFindManyReq = prisma.request.findMany;
  const origFindManyPlan = prisma.plan.findMany;
  const origFindManyFc = prisma.forecast.findMany;
  const origFindManyAppr = prisma.appraisal.findMany;
  const origFindManyCoach = prisma.coachingReport.findMany;

  try {
    const fixedDate = new Date('2026-10-11T12:00:00.000Z');

    prisma.request.findMany = async () => [];
    prisma.plan.findMany = async () => [];
    prisma.forecast.findMany = async () => [
      {
        id: 'fc-102',
        periodType: 'Monthly',
        periodDate: fixedDate,
        status: 'APPROVED',
        supervisorFeedback: 'Approved by manager.',
        updatedAt: fixedDate,
      },
    ];
    prisma.appraisal.findMany = async () => [
      {
        id: 'appr-202',
        feedbackComments: 'Quarterly review ready',
        updatedAt: fixedDate,
      },
    ];
    prisma.coachingReport.findMany = async () => [];

    let resBody = null;
    const req = {
      user: { id: 'rep-1', role: 'MEDICAL_REP' },
    };
    const res = {
      json(payload) {
        resBody = payload;
        return this;
      },
      status() { return this; },
    };

    const routeHandler = notificationRouter.stack.find((layer) => layer.route)?.route.stack[0].handle;
    await routeHandler(req, res, () => {});

    const notifs = resBody.data;
    const fcNotif = notifs.find((n) => n.id.startsWith('forecast:fc-102'));
    assert.ok(fcNotif);
    assert.equal(fcNotif.title, 'Forecast approved');
    assert.equal(fcNotif.href, '/rep/forecast');
    assert.equal(fcNotif.type, 'success');

    const apprNotif = notifs.find((n) => n.id.startsWith('appraisal:appr-202'));
    assert.ok(apprNotif);
    assert.equal(apprNotif.title, 'Performance appraisal');
    assert.equal(apprNotif.href, '/rep/appraisal');
  } finally {
    prisma.request.findMany = origFindManyReq;
    prisma.plan.findMany = origFindManyPlan;
    prisma.forecast.findMany = origFindManyFc;
    prisma.appraisal.findMany = origFindManyAppr;
    prisma.coachingReport.findMany = origFindManyCoach;
  }
});
