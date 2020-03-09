const { setResponse } = require('../../../utils');

const { Supply, SuppliedProduct } = require('../supplyModel');
const Product = require('../../product/productModel');
const Provider = require('../../provider/providerModel');
const Warehouse = require('../../warehouse/warehouseModel');

const createSupply = async reqBody => {
  let supply = await Supply.create(reqBody, {
    include: [SuppliedProduct],
  });

  // * Update object with nested entities
  supply = await Supply.findByPk(supply.id, {
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
  });

  return setResponse(201, 'Supply created.', supply);
};

module.exports = createSupply;
