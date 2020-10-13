const {
  Dispatch,
  DispatchedProduct,
  Product,
  Proforma,
  Client,
} = require('@dbModels');
const { setResponse } = require('@/utils');

const getDispatch = async reqParams => {
  const dispatch = await Dispatch.findByPk(reqParams.id, {
    include: [
      { all: true },
      {
        model: DispatchedProduct,
        include: {
          model: Product,
        },
      },
      {
        model: Proforma,
        include: {
          model: Client,
        },
      },
    ],
  });

  if (!dispatch) return setResponse(404, 'Dispatch not found.');
  return setResponse(200, 'Dispatch found.', dispatch);
};

module.exports = {
  getDispatch,
};
