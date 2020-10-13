const winston = require('winston');

const {
  Dispatch,
  DispatchedProduct,
  DispatchedProductBox,
  ProductBox,
} = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);
const { setResponse } = require('@/utils');
const { DISPATCH } = require('@/utils/constants');

// ? Se valida las componentes no transaccionales de la solicitud
const validatePostDispatchProductBox = async (reqParams, reqBody) => {
  const dispatchedProduct = await DispatchedProduct.findByPk(
    reqParams.dispatchedProductId,
    {
      where: { dispatchId: reqParams.id },
      include: [Dispatch],
    },
  );

  if (!dispatchedProduct)
    return setResponse(404, 'Dispatched product not found.');

  if (dispatchedProduct.dispatch.status !== DISPATCH.STATUS.OPEN)
    return setResponse(
      400,
      'Dispatch status is not open.',
      null,
      'El despacho esta bloqueado o ya ha sido completado.',
    );

  const productBox = await ProductBox.findByPk(reqBody.productBoxId);

  if (!productBox) return setResponse(404, 'ProductBox not found.');

  if (productBox.productId !== dispatchedProduct.productId)
    return setResponse(
      400,
      'Product of product box different from dispatched product.',
      null,
      'La caja contiene productos distintos a los requeridos',
    );

  if (productBox.stock < reqBody.quantity)
    return setResponse(
      400,
      'ProductBox stock is less than required.',
      null,
      'La caja no cuenta con productos suficientes.',
    );
  if (
    dispatchedProduct.quantity - dispatchedProduct.dispatched <
    reqBody.quantity
  )
    return setResponse(
      400,
      'DispatchedProduct remaining quantity is less than provided.',
      null,
      'La cantidad de unidades a despachar es mayor a la requerida.',
    );

  return setResponse(200, 'Ok.');
};

const postDispatchProductBox = async (reqParams, reqBody) => {
  const t = await sequelize.transaction();

  try {
    const dispatchedProduct = await DispatchedProduct.findByPk(
      reqParams.dispatchedProductId,
      {
        where: { dispatchId: reqParams.id },
        include: [Dispatch, DispatchedProductBox],

        transaction: t,
      },
    );

    await dispatchedProduct.createDispatchedProductBox(reqBody, {
      transaction: t,
    });

    await t.commit();
    await dispatchedProduct.reload();

    return setResponse(200, 'Product dispatched.', dispatchedProduct);
  } catch (error) {
    winston.error(error);
    await t.rollback();
    return setResponse(400, 'Dispatchment failed.');
  }
};

module.exports = {
  validatePostDispatchProductBox,
  postDispatchProductBox,
};
