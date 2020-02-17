const _ = require('lodash');

const { setResponse } = require('../../utils');

const { Supply, SuppliedProduct } = require('./supplyModel');
const Product = require('../product/productModel');
const Provider = require('../provider/providerModel');
const Warehouse = require('../warehouse/warehouseModel');

const PRODUCT_NESTED_ATTRIBUTES = [
  'id',
  'familyName',
  'subfamilyName',
  'elementName',
  'modelName',
  'code',
  'compatibility',
  'suggestedPrice',
];

const SUPPLIED_PRODUCT_NESTED_ATTRIBUTES = [
  'quantity',
  'boxSize',
  'status',
  'suppliedQuantity',
];

const readSupply = async reqBody => {
  const supply = await Supply.findByPk(reqBody.id, {
    include: SuppliedProduct,
  });
  if (!supply) return setResponse(400, 'Supply not found.');

  supply.products = await supply.getProducts();
  return setResponse(200, 'Supply found.', supply);
};

const listSupplies = async reqQuery => {
  let supplies = await Supply.findAll({
    include: [
      Warehouse,
      Provider,
      {
        model: SuppliedProduct,
        include: Product,
      },
    ],
  });

  // * Simplify response
  // supplies = supplies.map(_supply => {
  //   const supply = _supply.get({ plain: true });
  //   supply.products = supply.products.map(prod => {
  //     prod.suppliedProduct = _.pick(
  //       prod.suppliedProduct,
  //       SUPPLIED_PRODUCT_NESTED_ATTRIBUTES,
  //     );
  //     return prod;
  //   });
  //   return supply;
  // });

  return setResponse(200, 'Supplies found.', supplies);
};

const createSupply = async reqBody => {
  let supply = await Supply.create(_.omit(reqBody, ['suppliedProducts']));

  // * Create nested entities
  const suppliedProducts = await SuppliedProduct.bulkCreate(
    reqBody.suppliedProducts.map(data => {
      return { ...data, supplyId: supply.id };
    }),
  );

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

module.exports = {
  readSupply,
  listSupplies,
  createSupply,
};
