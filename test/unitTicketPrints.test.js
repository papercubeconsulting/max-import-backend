const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getExplodedBoxValidationError,
} = require('../api/inventory/unitTicketPrint/unitTicketPrint.utils');

test('an exploded box remains printable when its current unit stock is zero', () => {
  const box = {
    inventoryKind: 'PHYSICAL',
    lifecycleStatus: 'DISCARDED',
    boxSize: 12,
  };
  const explodedLots = [{ inventoryKind: 'EXPLODED', stock: 0 }];
  assert.equal(getExplodedBoxValidationError(box, explodedLots), null);
});

test('a physical active box cannot be included in a unit ticket batch', () => {
  const box = {
    inventoryKind: 'PHYSICAL',
    lifecycleStatus: 'ACTIVE',
    boxSize: 12,
  };
  assert.equal(
    getExplodedBoxValidationError(box, []),
    'La caja todavía no ha sido explotada.',
  );
});

test('an exploded box requires an origin unit lot and an original quantity', () => {
  const box = {
    inventoryKind: 'PHYSICAL',
    lifecycleStatus: 'DISCARDED',
    boxSize: 12,
  };
  assert.equal(
    getExplodedBoxValidationError(box, []),
    'No se encontró el lote unitario originado por esta caja.',
  );
  assert.equal(
    getExplodedBoxValidationError({ ...box, boxSize: 0 }, [{}]),
    'La caja no tiene una cantidad original válida.',
  );
});
