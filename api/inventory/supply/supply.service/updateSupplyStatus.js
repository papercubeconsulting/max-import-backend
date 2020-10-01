const { Supply, SuppliedProduct } = require('@dbModels');

const { setResponse } = require('../../../utils');
const { supplyStatus: status } = require('../../../utils/constants');

const updateSupplyStatus = async (reqBody, reqParams) => {
  const supply = await Supply.findByPk(reqParams.id, {
    include: SuppliedProduct,
  });
  if (!supply || supply.status !== status.PENDING)
    return setResponse(
      404,
      `Supply not found or current status different from ${status.PENDING}.`,
    );

  // * Si se desea cancelar no debe existir un supplied product con elementos atendidos
  if (
    reqBody.status === status.CANCELLED &&
    supply.suppliedProducts.some(obj => obj.suppliedQuantity)
  )
    return setResponse(
      400,
      'Supply with attended products can not be cancelled.',
    );

  // * Si se desea completar no debe existir un supplied product sin terminar de atender
  if (
    reqBody.status === status.ATTENDED &&
    supply.suppliedProducts.some(obj => obj.suppliedQuantity !== obj.quantity)
  )
    return setResponse(400, 'Some supplied products are not fully attended.');

  supply.status = reqBody.status;
  if (reqBody.status === status.ATTENDED) supply.attentionDate = new Date();
  if (reqBody.status === status.CANCELLED) supply.cancellationDate = new Date();
  await supply.save();

  return setResponse(200, 'Supply status updated.');
};

module.exports = { updateSupplyStatus };
