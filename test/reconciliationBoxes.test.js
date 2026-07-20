const test = require('node:test');
const assert = require('node:assert/strict');
const {
  calculateBoxReduction,
  sumBoxReductions,
} = require('../api/inventory/reconciliation/reconciliation.utils');

test('box reconciliation allows reducing a box to zero', () => {
  assert.equal(calculateBoxReduction(12, 0), 12);
});

test('box reconciliation only permits downward stock changes', () => {
  assert.throws(() => calculateBoxReduction(12, 12));
  assert.throws(() => calculateBoxReduction(12, 13));
  assert.throws(() => calculateBoxReduction(12, -1));
});

test('box reconciliation totals reductions across multiple boxes', () => {
  assert.equal(
    sumBoxReductions([{ quantity: 3 }, { quantity: 7 }, { quantity: 2 }]),
    12,
  );
});
