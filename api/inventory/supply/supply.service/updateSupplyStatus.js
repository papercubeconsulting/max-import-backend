const { Supply, SuppliedProduct, ProductBox } = require('@dbModels');

const { setResponse } = require('../../../utils');
const { supplyStatus: status } = require('../../../utils/constants');

const updateSupplyStatus = async (reqBody, reqParams) => {
  const supply = await Supply.findByPk(reqParams.id, {
    include: SuppliedProduct,
  });
  // || supply.status !== status.PENDING
  if (!supply)
    return setResponse(
      404,
      `Supply not found or current status different from ${status.PENDING}.`,
    );

  if (supply.status === status.ATTENDED) {
    const suppliedProducts = await SuppliedProduct.findAll({
      where: { supplyId: supply.id },
    });
    for (const suppliedProduct of suppliedProducts) {
      const productBoxes = await ProductBox.findAll({
        where: { suppliedProductId: suppliedProduct.id },
      });

      for (const productBox of productBoxes) {
        if (productBox.boxSize > productBox.stock) {
          return setResponse(
            404,
            `El abastecimiento tiene items de cajas despachadas`,
          );
        }
      }

      await ProductBox.destroy({
        where: { suppliedProductId: suppliedProduct.id },
      });

    }
    await SuppliedProduct.destroy({
      where: { supplyId: supply.id },
    });
    supply.status = reqBody.status;
    if (reqBody.status === status.CANCELLED){
      supply.cancellationDate = new Date();
    }


    await supply.save();

    return setResponse(200, 'Supply status updated.');
  }
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
