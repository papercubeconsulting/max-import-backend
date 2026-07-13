const buildUnitBarcode = productId => `2${String(productId).padStart(15, '0')}`;

const allocateStock = (lots, quantity) => {
  let remaining = quantity;
  const allocations = [];
  for (const lot of lots) {
    if (remaining <= 0) break;
    const allocated = Math.min(lot.stock, remaining);
    if (allocated > 0) allocations.push({ lot, quantity: allocated });
    remaining -= allocated;
  }
  return { allocations, remaining };
};

module.exports = { allocateStock, buildUnitBarcode };
