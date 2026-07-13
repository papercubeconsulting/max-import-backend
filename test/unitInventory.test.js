const test = require('node:test');
const assert = require('node:assert/strict');
const {
  allocateStock,
  buildUnitBarcode,
} = require('../api/inventory/unitInventory.utils');

test('unit barcode is stable, numeric, prefixed with 2 and 16 digits long', () => {
  assert.equal(buildUnitBarcode(123), '2000000000000123');
  assert.match(buildUnitBarcode(987654), /^2\d{15}$/);
  assert.equal(buildUnitBarcode(123), buildUnitBarcode(123));
  assert.notEqual(buildUnitBarcode(123), buildUnitBarcode(124));
});

test('FIFO allocation spans lots without exceeding requested quantity', () => {
  const lots = [
    { id: 1, stock: 5 },
    { id: 2, stock: 4 },
    { id: 3, stock: 8 },
  ];
  const result = allocateStock(lots, 7);
  assert.equal(result.remaining, 0);
  assert.deepEqual(
    result.allocations.map(item => ({ id: item.lot.id, quantity: item.quantity })),
    [
      { id: 1, quantity: 5 },
      { id: 2, quantity: 2 },
    ],
  );
});

test('allocation reports an unmet remainder when stock is insufficient', () => {
  const result = allocateStock([{ id: 1, stock: 2 }], 5);
  assert.equal(result.remaining, 3);
  assert.equal(result.allocations[0].quantity, 2);
});
