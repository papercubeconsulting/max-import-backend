const _ = require('lodash');
const { Op } = require('sequelize');

const { setResponse } = require('../../../utils');

const {
  Product,
  Provider,
  Family,
  Subfamily,
  Element,
  Model,
} = require('@dbModels');

const checkCategory = async (
  Category,
  categoryId,
  categoryName,
  categoryCode,
  parent,
  parentKey,
  depth,
) => {
  let category;
  // * Es un registro q ya existe en la DB
  if (categoryId) {
    // * validar si existe en la db
    category = await Category.findByPk(categoryId);
    if (
      !category ||
      category.name !== categoryName ||
      category.code !== categoryCode
    )
      return {
        valid: false,
        message: `Invalid Id or Name or Code for ${categoryName}`,
      };
    if (!parent && depth !== 0)
      // * El padre debe existir a menos que sea raiz
      return {
        valid: false,
        message: `No parentId provided for ${categoryName}`,
      };
    if (parent)
      if (category[parentKey] !== parent.id)
        // * El id del padre no coincide
        return {
          valid: false,
          message: `Wrong parent provided for ${categoryName}`,
        };
    return {
      valid: true,
      message: 'Valid existing category',
      next: category,
    }; // * se devuelve el objeto
  }

  // * La entidad no existe por lo que sera creada

  // * Se debe validar que el registro no sea repetido
  const query = {
    [Op.or]: [
      {
        name: categoryName,
      },
      {
        code: categoryCode,
      },
    ],
  };
  // * En caso exista un padre
  if (parentKey && parent && parent.id) query[parentKey] = parent.id;

  category = await Category.findOne({ where: query });
  if (category)
    // * entidad repetida
    return {
      valid: false,
      message: `${categoryName} or ${categoryCode} already exists`,
    };

  // * Pasa los requisitos
  return {
    valid: true,
    message: 'New category to create',
  };
};

const validatePost = async reqBody => {
  const provider = await Provider.findByPk(reqBody.providerId);
  if (!provider) return setResponse(404, 'Provider not found');

  const family = await checkCategory(
    Family,
    reqBody.familyId,
    reqBody.familyName,
    reqBody.familyCode,
    null,
    null,
    0,
  );
  if (!family.valid) return setResponse(400, family.message);

  const subfamily = await checkCategory(
    Subfamily,
    reqBody.subfamilyId,
    reqBody.subfamilyName,
    reqBody.subfamilyCode,
    family.next,
    'familyId',
    1,
  );
  if (!subfamily.valid) return setResponse(400, subfamily.message);

  const element = await checkCategory(
    Element,
    reqBody.elementId,
    reqBody.elementName,
    reqBody.elementCode,
    subfamily.next,
    'subfamilyId',
    2,
  );
  if (!element.valid) return setResponse(400, element.message);

  const model = await checkCategory(
    Model,
    reqBody.modelId,
    reqBody.modelName,
    null,
    element.next,
    'elementId',
    3,
  );
  if (!model.valid) return setResponse(400, model.message);

  return setResponse(200, 'Valida data provided', {
    family,
    subfamily,
    element,
    model,
  });
};

const createCategories = async (reqBody, categories) => {
  const family = categories.family.next
    ? categories.family.next
    : await Family.create({
        name: reqBody.familyName,
        code: reqBody.familyCode,
      });
  const subfamily = categories.subfamily.next
    ? categories.subfamily.next
    : await Subfamily.create({
        name: reqBody.subfamilyName,
        code: reqBody.subfamilyCode,
        familyId: family.id,
      });
  const element = categories.element.next
    ? categories.element.next
    : await Element.create({
        name: reqBody.elementName,
        code: reqBody.elementCode,
        subfamilyId: subfamily.id,
      });
  const model = categories.model.next
    ? categories.model.next
    : await Model.create({
        name: reqBody.modelName,
        elementId: element.id,
      });
  return setResponse(201, 'Categories created', {
    family,
    subfamily,
    element,
    model,
  });
};

const createProduct = async reqBody => {
  const model = await Model.findByPk(reqBody.modelId);
  if (!model) return setResponse(404, 'Model not found.');
  console.log({
    where: _.pick(reqBody, ['modelId']),
  });
  let product = await Product.findOne({
    where: _.pick(reqBody, ['modelId']),
  });
  if (product) return setResponse(400, 'Product already exists.');

  product = await Product.create(reqBody);

  return setResponse(201, 'Product created.', product);
};

module.exports = {
  createProduct,
  validatePost,
  createCategories,
};
