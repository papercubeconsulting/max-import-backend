const { setResponse } = require('../../../utils');

const { Supply, SuppliedProduct } = require('../supply.model');
const { Product } = require('../../product/product.model');
const { Provider } = require('../../provider/provider.model');
const { Warehouse } = require('../../warehouse/warehouse.model');
const { ProductBox } = require('../../productbox/productbox.model');

const readSupply = async reqParams => {
  const supply = await Supply.findByPk(reqParams.id, {
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: [
          Product,
          {
            model: ProductBox,
            attributes: ['indexFromSupliedProduct', 'trackingCode'],
          },
        ],
      },
    ],
    order: [[{ model: SuppliedProduct }, 'id', 'ASC']],
  });
  if (!supply) return setResponse(404, 'Supply not found.');

  return setResponse(200, 'Supply found.', supply);
};

module.exports = { readSupply };
