const { setResponse } = require('../../../utils');

const { Supply, SuppliedProduct } = require('../supplyModel');
const { Product } = require('../../product/productModel');
const { Provider } = require('../../provider/providerModel');
const { Warehouse } = require('../../warehouse/warehouseModel');
const { ProductBox } = require('../../productbox/productboxModel');

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