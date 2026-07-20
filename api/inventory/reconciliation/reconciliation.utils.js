const calculateBoxReduction = (stock, targetStock) => {
  if (!Number.isInteger(stock) || !Number.isInteger(targetStock))
    throw new Error('Las cantidades de caja deben ser números enteros.');
  if (stock <= 0) throw new Error('La caja debe tener stock disponible.');
  if (targetStock < 0 || targetStock >= stock)
    throw new Error(
      'El nuevo stock debe ser menor que el actual y no negativo.',
    );
  return stock - targetStock;
};

const sumBoxReductions = (sources) =>
  sources.reduce((sum, source) => sum + Number(source.quantity || 0), 0);

module.exports = { calculateBoxReduction, sumBoxReductions };
