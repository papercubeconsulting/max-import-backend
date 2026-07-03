const { Op } = require('sequelize');
const { ProductGroup } = require('@dbModels');

const { setResponse } = require('../../utils');

const ALLOWED_GROUP_PREFIXES = ['ALT'];

const normalizeGroupCode = code => (code || '').trim().toUpperCase();

const getGroupPrefix = code => normalizeGroupCode(code).split('-')[0];

const isAllowedGroupCode = code =>
  ALLOWED_GROUP_PREFIXES.some(prefix =>
    new RegExp(`^${prefix}-\\d+$`).test(normalizeGroupCode(code)),
  );

const normalizeProductGroupBody = reqBody => ({
  ...reqBody,
  name: normalizeGroupCode(reqBody.name),
  code: normalizeGroupCode(reqBody.code),
});

const validateProductGroupPrefix = reqBody => {
  if (!isAllowedGroupCode(reqBody.code)) {
    return setResponse(
      400,
      `Product group code must use one of these formats: ${ALLOWED_GROUP_PREFIXES.map(
        prefix => `${prefix}-XX`,
      ).join(
        ', ',
      )}.`,
    );
  }
  return null;
};

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

const suggestProductGroupCode = async reqQuery => {
  const prefix = normalizeGroupCode(reqQuery.prefix);

  if (!ALLOWED_GROUP_PREFIXES.includes(prefix)) {
    return setResponse(
      400,
      `Product group prefix must be one of: ${ALLOWED_GROUP_PREFIXES.join(
        ', ',
      )}.`,
    );
  }

  const productGroups = await ProductGroup.findAll({
    attributes: ['code'],
    where: {
      code: {
        [Op.iLike]: `${prefix}-%`,
      },
    },
  });

  const maxCorrelative = productGroups.reduce((max, productGroup) => {
    const match = normalizeGroupCode(productGroup.code).match(
      new RegExp(`^${prefix}-(\\d+)$`),
    );
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);
  const nextCorrelative = maxCorrelative + 1;
  const nextCode = `${prefix}-${String(nextCorrelative).padStart(2, '0')}`;

  return setResponse(200, 'Product group code suggested.', {
    prefix,
    code: nextCode,
    name: nextCode,
    label: `Nuevo: ${nextCode}`,
    isNew: true,
  });
};

const createProductGroup = async reqBody => {
  reqBody = normalizeProductGroupBody(reqBody);
  const prefixError = validateProductGroupPrefix(reqBody);
  if (prefixError) return prefixError;

  let productGroup = await ProductGroup.findOne({
    where: { [Op.or]: [{ name: reqBody.name }, { code: reqBody.code }] },
  });
  if (productGroup) return setResponse(400, 'Product group already exists.');

  productGroup = await ProductGroup.create(reqBody);

  return setResponse(201, 'Product group created.', productGroup);
};

const updateProductGroup = async (reqParams, reqBody) => {
  reqBody = normalizeProductGroupBody(reqBody);
  const prefixError = validateProductGroupPrefix(reqBody);
  if (prefixError) return prefixError;

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
  suggestProductGroupCode,
  createProductGroup,
  updateProductGroup,
};
