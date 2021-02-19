const { Dispatch, DispatchedProduct } = require('@dbModels');

const { setResponse } = require('@/utils');
const { DISPATCH } = require('@/utils/constants');

const postFinishDispatch = async (reqParams, reqUser) => {
  const dispatch = await Dispatch.findByPk(reqParams.id, {
    include: [DispatchedProduct],
  });
  if (!dispatch) return setResponse(404, 'Dispatch not found.');

  if (dispatch.status !== DISPATCH.STATUS.OPEN.value)
    return setResponse(
      400,
      'Dispatch status is not open.',
      null,
      'El despacho esta bloqueado o ya ha sido completado.',
    );

  const completed = dispatch.dispatchedProducts.every(
    ({ quantity, dispatched }) => quantity === dispatched,
  );

  if (!completed)
    return setResponse(
      400,
      'Some dispatchedProduct is not fully dispatched.',
      null,
      'Al menos un producto no ha sido completamente despachado',
    );

  dispatch.status = DISPATCH.STATUS.COMPLETED.value;
  dispatch.completedAt = new Date();
  dispatch.dispatcherId = reqUser.id;

  await dispatch.save();

  return setResponse(200, 'Dispatch is completed', dispatch);
};

module.exports = { postFinishDispatch };
