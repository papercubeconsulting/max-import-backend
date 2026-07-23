const getExplodedBoxValidationError = (productBox, explodedLots = []) => {
  if (!productBox) return 'Caja no encontrada.';
  if (
    productBox.inventoryKind !== 'PHYSICAL' ||
    productBox.lifecycleStatus !== 'DISCARDED'
  )
    return 'La caja todavía no ha sido explotada.';
  if (!Number.isInteger(productBox.boxSize) || productBox.boxSize <= 0)
    return 'La caja no tiene una cantidad original válida.';
  if (!explodedLots.length)
    return 'No se encontró el lote unitario originado por esta caja.';
  return null;
};

module.exports = { getExplodedBoxValidationError };
