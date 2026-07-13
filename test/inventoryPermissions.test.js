const test = require('node:test');
const assert = require('node:assert/strict');
const {
  defineAbilityFor,
} = require('../api/middleware/authorization/roles');

test('manager can reconcile and logistics can only read inventory history', () => {
  const manager = defineAbilityFor('manager');
  const logistic = defineAbilityFor('logistic');
  assert.equal(manager.can('reconcile', 'inventory'), true);
  assert.equal(logistic.can('read', 'inventory'), true);
  assert.equal(logistic.can('reconcile', 'inventory'), false);
});

test('seller can resolve inventory codes but cannot print or reconcile', () => {
  const seller = defineAbilityFor('seller');
  assert.equal(seller.can('read', 'inventory'), true);
  assert.equal(seller.can('print', 'inventory'), false);
  assert.equal(seller.can('reconcile', 'inventory'), false);
});
