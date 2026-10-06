import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiFeatures } from '../utils/apiFeatures.js';
test('default pagination ordering has a unique tie-breaker for imported records', () => {
  for (const model of ['Doctor', 'Visit', 'Pharmacy', 'User', 'Sales']) {
    const { queryObj } = new ApiFeatures({}, model).applyFeatures({});
    assert.deepEqual(queryObj.orderBy, [{ createdAt: 'desc' }, { id: 'desc' }]);
  }
});
test('custom sorting remains stable without duplicating an explicit id sort', () => {
  const requested = new ApiFeatures({}, 'Doctor').applyFeatures({ sort: 'specialty,-createdAt' });
  assert.deepEqual(requested.queryObj.orderBy, [{ specialty: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }]);
  const explicit = new ApiFeatures({}, 'Doctor').applyFeatures({ sort: 'nameEN,id' });
  assert.deepEqual(explicit.queryObj.orderBy, [{ nameEN: 'asc' }, { id: 'asc' }]);
});
