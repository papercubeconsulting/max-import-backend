const { Supply, SuppliedProduct, Product } = require('@dbModels');

const { setResponse } = require('../../../utils');
const {
  supplyStatus: status,
  supplyTypes,
} = require('../../../utils/constants');
const {
  StoreReturnError,
  validateStoreReturnRequest,
} = require('./storeReturn');

// ? Servicio para actualiza campos del abastecimiento y añadir/remover productos
// ? El abastecimiento debe estar sin atender
const validateUpdateSupply = async (reqBody, reqParams) => {
  const supply = await Supply.findByPk(reqParams.id);

  // * Se verifica si el abastecimiento existe y esta en estado pendiente
  if (!supply) return setResponse(404, 'Supply not found.');
  if (supply.status !== status.PENDING)
    return setResponse(400, 'Supply already cancelled or completed.');
  if (reqBody.type && reqBody.type !== supply.type)
    return setResponse(
      400,
      'Supply type cannot be changed.',
      null,
      'El tipo del abastecimiento no puede modificarse después de crearlo.',
    );

  // * Se verifica si los productos que fueron removidos no han sido ya procesados
  const suppliedProducts = await SuppliedProduct.findAll({
    where: { supplyId: reqParams.id },
    include: [Product],
  });

  if (
    supply.type === supplyTypes.STORE_RETURN &&
    suppliedProducts.some(item => item.suppliedQuantity > 0)
  )
    return setResponse(
      400,
      'Attended store return cannot be edited.',
      null,
      'La devolución ya generó cajas y no puede editarse.',
    );

  if (supply.type === supplyTypes.STORE_RETURN) {
    try {
      await validateStoreReturnRequest({
        ...reqBody,
        type: supplyTypes.STORE_RETURN,
        providerId: null,
      });
    } catch (error) {
      if (error instanceof StoreReturnError)
        return setResponse(error.status, 'Invalid store return.', null, error.message);
      throw error;
    }
  }

  // * Elementos que NO estan en el query pero si en la DB
  const deleteSuppliedProducts = suppliedProducts.filter(
    dbProd =>
      !reqBody.suppliedProducts.some(
        queryProd =>
          dbProd.productId === queryProd.productId &&
          dbProd.boxSize === queryProd.boxSize,
      ),
  );

  // * Elementos que estan en el query y en la DB pero con cantidades distintas
  const updateSuppliedProducts = suppliedProducts.filter(dbProd =>
    reqBody.suppliedProducts.some(
      queryProd =>
        dbProd.productId === queryProd.productId &&
        dbProd.boxSize === queryProd.boxSize &&
        dbProd.quantity !== queryProd.quantity,
    ),
  );

  // * Elementos que estan en el query pero NO en la db
  const newSuppliedProducts = reqBody.suppliedProducts.filter(
    queryProd =>
      !suppliedProducts.some(
        dbProd =>
          dbProd.productId === queryProd.productId &&
          dbProd.boxSize === queryProd.boxSize,
      ),
  );

  // ? ---------------------------------
  // ? Validaciones según reglas

  // * Si un elemento que se desea remover ya ha sido registrado, se indica que en este solo puede actualizarse la cantidad de cajas
  const alreadyDispatchedIds = deleteSuppliedProducts.filter(
    row => row.suppliedQuantity,
  );

  const errorMessages = [];

  if (alreadyDispatchedIds)
    alreadyDispatchedIds.reduce((accumulator, currentValue) => {
      accumulator.push(
        `El producto ${currentValue.id} ya ha generado al menos un códigos de barras y no puede eliminarse`,
      );
      return accumulator;
    }, errorMessages);

  // * Si el elemento a actualizar indica una cantidad de cajas menor a las ya entregadas

  const partialDispatchedIds = updateSuppliedProducts.filter(row => {
    const queryProd = reqBody.suppliedProducts.find(
      qProd =>
        row.productId === qProd.productId && row.boxSize === qProd.boxSize,
    );
    return row.suppliedQuantity > queryProd.quantity;
  });

  if (partialDispatchedIds)
    partialDispatchedIds.reduce((accumulator, currentValue) => {
      accumulator.push(
        `El producto ${currentValue.id} ya ha generado ${currentValue.suppliedQuantity} códigos de barras y no puede actualizarse a una cantidad menor a esa`,
      );
      return accumulator;
    }, errorMessages);

  if (Array.isArray(errorMessages) && errorMessages.length)
    return setResponse(
      400,
      'Bad Request.',
      null,
      // {
      //   deleteSuppliedProducts,
      //   newSuppliedProducts,
      //   updateSuppliedProducts,
      // },
      errorMessages.join(' | '),
    );

  return setResponse(200, 'Supply valid for update.', {
    deleteSuppliedProducts,
    newSuppliedProducts,
    updateSuppliedProducts,
  });
};

module.exports = { validateUpdateSupply };
