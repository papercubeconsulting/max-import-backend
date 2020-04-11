const _ = require('lodash');
const { Op } = require('sequelize');

const { setResponse, paginate } = require('../../utils');

const Product = require('./productModel');
const ProductBox = require('../productbox/productboxModel');
const Warehouse = require('../warehouse/warehouseModel');
const Family = require('../family/familyModel');
const Subfamily = require('../subfamily/subfamilyModel');
const Element = require('../element/elementModel');
const Model = require('../model/modelModel');

const readProduct = async reqParams => {
  const product = await Product.findByPk(reqParams.id, {
    include: [
      {
        model: ProductBox,
        where: { stock: { [Op.gt]: 0 } },
        attributes: ['id', 'stock', 'boxSize'],
        include: [
          {
            model: Warehouse,
            attributes: ['type', 'id', 'name'],
          },
        ],
        required: false,
      },
    ],
  });
  if (!product) return setResponse(404, 'Product not found.');

  return setResponse(200, 'Product found.', product.aggregateStock(true));
};

// TODO: Considerar stock nulo

const listProducts = async reqQuery => {
  const products = await Product.findAndCountAll({
    where: _.pick(reqQuery, [
      'code',
      'familyId',
      'subfamilyId',
      'elementId',
      'modelId',
    ]),
    attributes: { exclude: 'imageBase64' },
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: ProductBox,
        where: reqQuery.stock === 'yes' ? { stock: { [Op.gt]: 0 } } : undefined,
        attributes: ['id', 'stock'],
        include: [
          {
            model: Warehouse,
            attributes: ['type', 'id', 'name'],
          },
        ],
        // required: false,
      },
    ],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  products.rows = products.rows.map(product => product.aggregateStock());
  products.page = reqQuery.page;
  products.pageSize = reqQuery.pageSize;
  products.pages = _.ceil(products.count / products.pageSize);

  return setResponse(200, 'Products found.', products);
};

// TODO: Crear nuevo servicio que:
// TODO  3. Tome en cuenta la imagen

const checkCategory = async (
  Category,
  categoryId,
  categoryName,
  parent,
  parentKey,
  depth,
) => {
  let category;
  if (categoryId) {
    // * validar si existe en la db
    category = await Category.findByPk(categoryId);
    if (!category || category.name !== categoryName)
      return {
        valid: false,
        message: `Invalid Id or Name for ${categoryName}`,
      };
    if (!parent && depth !== 0)
      // * El padre debe existir a menos que se raiz
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
  if (parent) {
    // * Hay un padre, se debe validar que no sea repetido
    const data = {};
    data.name = categoryName;
    if (parentKey) data[parentKey] = parent.id;
    category = await Category.findOne({ where: data });
    if (category)
      // * entidad repetida
      return { valid: false, message: `${categoryName} already exists` };
  } else if (depth === 0) {
    category = await Category.findOne({ where: { name: categoryName } });
    if (category)
      return { valid: false, message: `${categoryName} already exists` };
  }
  return {
    valid: true,
    message: 'New category to create',
  };
};

const validatePost = async reqBody => {
  const family = await checkCategory(
    Family,
    reqBody.familyId,
    reqBody.familyName,
    null,
    null,
    0,
  );
  if (!family.valid) return setResponse(400, family.message);

  const subfamily = await checkCategory(
    Subfamily,
    reqBody.subfamilyId,
    reqBody.subfamilyName,
    family.next,
    'familyId',
    1,
  );
  if (!subfamily.valid) return setResponse(400, subfamily.message);

  const element = await checkCategory(
    Element,
    reqBody.elementId,
    reqBody.elementName,
    subfamily.next,
    'subfamilyId',
    2,
  );
  if (!element.valid) return setResponse(400, element.message);

  const model = await checkCategory(
    Model,
    reqBody.modelId,
    reqBody.modelName,
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
    : await Family.create({ name: reqBody.familyName });
  const subfamily = categories.subfamily.next
    ? categories.subfamily.next
    : await Subfamily.create({
        name: reqBody.subfamilyName,
        familyId: family.id,
      });
  const element = categories.element.next
    ? categories.element.next
    : await Element.create({
        name: reqBody.elementName,
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
  let product = await Product.findOne({
    where: _.pick(reqBody, ['modelId']),
  });
  if (product) return setResponse(400, 'Product already exists.');

  product = await Product.create(reqBody);

  return setResponse(201, 'Product created.', product);
};

module.exports = {
  readProduct,
  listProducts,
  createProduct,
  validatePost,
  createCategories,
};
