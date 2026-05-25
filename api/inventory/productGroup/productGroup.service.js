const { Op } = require('sequelize');
const { ProductGroup } = require('@dbModels');

const { setResponse } = require('../../utils');

const readProductGroup = async reqParams => {
  const productGroup = await ProductGroup.findByPk(reqParams.id);
  if (!productGroup) return setResponse(404, 'Product group not found.');

  return setResponse(200, 'Product group found.', productGroup);
};

const listProductGroups = async reqQuery => {
  const productGroups = await ProductGroup.findAll({
    where: reqQuery,
    order: ['name'],
  });

  return setResponse(200, 'Product groups found.', productGroups);
};

const createProductGroup = async reqBody => {
  let productGroup = await ProductGroup.findOne({
    where: { [Op.or]: [{ name: reqBody.name }, { code: reqBody.code }] },
  });
  if (productGroup) return setResponse(400, 'Product group already exists.');

  productGroup = await ProductGroup.create(reqBody);

  return setResponse(201, 'Product group created.', productGroup);
};

const updateProductGroup = async (reqParams, reqBody) => {
  const productGroup = await ProductGroup.findByPk(reqParams.id);
  if (!productGroup) return setResponse(404, 'Product group not found.');

  const repeatedProductGroup = await ProductGroup.findOne({
    where: {
      id: { [Op.ne]: reqParams.id },
      [Op.or]: [{ name: reqBody.name }, { code: reqBody.code }],
    },
  });
  if (repeatedProductGroup)
    return setResponse(400, 'Product group already exists.');

  await productGroup.update(reqBody);

  return setResponse(200, 'Product group updated.', productGroup);
};

module.exports = {
  readProductGroup,
  listProductGroups,
  createProductGroup,
  updateProductGroup,
};
