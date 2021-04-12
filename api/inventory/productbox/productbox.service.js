const {
  ProductBox,
  ProductBoxLog,
  Product,
  Provider,
  Supply,
  Warehouse,
  User,
} = require('@dbModels');

const { setResponse } = require('../../utils');

const getProductBox = async reqParams => {
  const productBox = await ProductBox.findOne({
    where: reqParams,
    include: [
      {
        model: Product,
        include: [Provider],
        attributes: { exclude: 'imageBase64' },
      },
      Warehouse,
      {
        model: ProductBoxLog,
        include: [
          { model: Warehouse, attributes: ['name'] },
          { model: User, attributes: ['name', 'lastname'] },
        ],
      },
    ],
    order: [[{ model: ProductBoxLog }, 'createdAt', 'DESC']],
  });
  if (!productBox) return setResponse(404, 'ProductBox not found.');

  return setResponse(200, 'ProductBox found.', productBox);
};

const listProductBoxes = async reqQuery => {
  const productBoxes = await ProductBox.findAll({
    where: reqQuery,
    include: [Warehouse, Supply, { model: Warehouse, as: 'previousWarehouse' }],
  });

  return setResponse(200, 'ProductBoxs found.', productBoxes);
};

const createProductBox = async reqBody => {
  const productBox = await ProductBox.create(reqBody);

  return setResponse(201, 'ProductBox created.', productBox);
};

const putProductBox = async (reqBody, reqParams, reqUser) => {
  const productBox = await ProductBox.findByPk(reqParams.id);
  if (!productBox) return setResponse(404, 'ProductBox not found.');
  if (reqBody.warehouseId) {
    reqBody.previousWarehouseId = productBox.dataValues.warehouseId;
    const warehouse = await Warehouse.findByPk(reqBody.warehouseId);
    if (!warehouse) return setResponse(404, 'Warehouse not found.');
  }
  await productBox.update(reqBody);
  productBox.registerLog(reqBody.message, reqUser);
  return setResponse(200, 'ProductBox updated.', productBox);
};

const putMoveProductBoxes = async (reqBody, reqUser) => {
  let boxes = reqBody.boxes;
  for (let i = 0; i < boxes.length; i++) {
    console.log(boxes[i].id);
    const productBox = await ProductBox.findByPk(boxes[i].id);
    if (!productBox) return setResponse(404, 'ProductBox not found.');
  }
  for (let i = 0; i < boxes.length; i++) {
    const productBox = await ProductBox.findByPk(boxes[i].id);
    let item ={
      warehouseId:boxes[i].warehouseId,
      previousWarehouseId:boxes[i].previousWarehouseId,
    }
    await productBox.update(item);
    productBox.registerLog(reqBody.message, reqUser);
  }
  return setResponse(200, 'ProductBox updated.', boxes);
};

module.exports = {
  getProductBox,
  listProductBoxes,
  createProductBox,
  putProductBox,
  putMoveProductBoxes,
};
