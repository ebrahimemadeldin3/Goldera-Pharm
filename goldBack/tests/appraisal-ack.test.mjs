import assert from 'node:assert/strict';
import { test } from 'node:test';
import { acknowledgeAppraisal } from '../controllers/appraisal.controller.js';
import { prisma } from '../config/db.js';

test('acknowledgeAppraisal atomically persists acknowledgement and comment', async () => {
  let updatedData = null;
  const originalFindUnique = prisma.appraisal.findUnique;
  const originalUpdate = prisma.appraisal.update;

  try {
    prisma.appraisal.findUnique = async ({ where }) => {
      if (where.id === 'appraisal-1') {
        return { id: 'appraisal-1', repId: 'rep-1', acknowledged: false };
      }
      return null;
    };

    prisma.appraisal.update = async ({ where, data, include }) => {
      updatedData = { where, data, include };
      return {
        id: where.id,
        ...data,
        rep: { id: 'rep-1', name: 'Rep One', email: 'rep1@test.com' },
        manager: { id: 'mgr-1', name: 'Manager One', email: 'mgr1@test.com' },
      };
    };

    const req = {
      params: { id: 'appraisal-1' },
      user: { id: 'rep-1' },
      body: { accept: true, comment: '  Understood targets for next quarter.  ' },
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

    await acknowledgeAppraisal(req, res, () => {});

    assert.equal(responseStatus, 200);
    assert.equal(responseBody.status, 'success');
    assert.equal(responseBody.data.acknowledged, true);
    assert.equal(responseBody.data.acknowledgementComment, 'Understood targets for next quarter.');
    assert.equal(updatedData.data.acknowledgementComment, 'Understood targets for next quarter.');
    assert.equal(updatedData.data.acknowledged, true);
    assert.ok(updatedData.data.acknowledgedAt instanceof Date);
  } finally {
    prisma.appraisal.findUnique = originalFindUnique;
    prisma.appraisal.update = originalUpdate;
  }
});

test('acknowledgeAppraisal rejects appraisal when not assigned to requesting rep', async () => {
  const originalFindUnique = prisma.appraisal.findUnique;

  try {
    prisma.appraisal.findUnique = async () => ({ id: 'appraisal-1', repId: 'rep-other' });

    const req = {
      params: { id: 'appraisal-1' },
      user: { id: 'rep-wrong' },
      body: { accept: true, comment: 'test' },
    };

    let nextError = null;
    const next = (err) => {
      nextError = err;
    };
    const res = {
      status() { return this; },
      json() { return this; },
    };

    await acknowledgeAppraisal(req, res, next);
    assert.ok(nextError);
    assert.equal(nextError.statusCode, 403);
  } finally {
    prisma.appraisal.findUnique = originalFindUnique;
  }
});
