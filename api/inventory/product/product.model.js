/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');
const _ = require('lodash');

// const { Op } = Sequelize;
const sequelize = require(`@root/startup/db`);

const { Provider } = require('../provider/provider.model');

const { Family } = require('../family/family.model');
const { Subfamily } = require('../subfamily/subfamily.model');
const { Element } = require('../element/element.model');
const { Model } = require('../model/model.model');

const Product = sequelize.define(
  'product',
  {
    // attributes
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    familyName: {
      type: Sequelize.STRING,
    },
    subfamilyName: {
      type: Sequelize.STRING,
    },
    elementName: {
      type: Sequelize.STRING,
    },
    modelName: {
      type: Sequelize.STRING,
    },
    code: {
      type: Sequelize.STRING,
    },
    compatibility: {
      type: Sequelize.TEXT,
      defaultValue: '',
    },
    tradename: {
      type: Sequelize.TEXT,
      defaultValue: '',
    },
    imageBase64: {
      type: Sequelize.DataTypes.BLOB,
      get() {
        return this.getDataValue('imageBase64')
          ? this.getDataValue('imageBase64').toString('utf8')
          : undefined;
      },
    },
    suggestedPrice: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    availableStock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    damagedStock: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
  },
  {
    // options
    defaultScope: {
      attributes: { exclude: ['imageBase64'] },
    },
    scopes: {
      full: {},
    },
  },
);

Product.beforeCreate('SetId', async (product, options) => {
  product.id = product.modelId;
  const [categories, provider] = await Promise.all([
    Model.findOne({
      attributes: ['name', 'code', 'elementId'],
      where: { id: product.modelId },
      include: [
        {
          model: Element,
          attributes: ['name', 'code', 'subfamilyId'],
          include: [
            {
              model: Subfamily,
              attributes: ['name', 'code', 'familyId'],
              include: [{ model: Family, attributes: ['name', 'code'] }],
            },
          ],
        },
      ],
    }),
    Provider.findByPk(product.providerId),
  ]);

  product.modelName = categories.name;

  product.elementId = categories.elementId;
  product.elementName = categories.element.name;

  product.subfamilyId = categories.element.subfamilyId;
  product.subfamilyName = categories.element.subfamily.name;

  product.familyId = categories.element.subfamily.familyId;
  product.familyName = categories.element.subfamily.family.name;

  product.code = `${categories.element.subfamily.family.code}-${categories.element.subfamily.code}-${categories.element.code}-${provider.code}-${categories.code}`;
});

Product.aggregateStock = function(product, includeBoxSizeDetail = false) {
  product.totalStock = 0;
  product.stockByWarehouse = Object.values(
    product.productBoxes.reduce(
      (accumulator, currentValue, currentIndex, array) => {
        const key = currentValue.warehouse.id;
        if (!_.get(accumulator, [key]))
          accumulator[key] = {
            warehouseId: currentValue.warehouse.id,
            warehouseName: currentValue.warehouse.name,
            warehouseType: currentValue.warehouse.type,
            stock: 0,
          };
        accumulator[key].stock += currentValue.stock;
        product.totalStock += currentValue.stock;
        return accumulator;
      },
      {},
    ),
  );

  product.stockByWarehouseType = Object.values(
    product.productBoxes.reduce((accumulator, currentValue) => {
      const key = currentValue.warehouse.type;
      if (!_.get(accumulator, [key]))
        accumulator[key] = {
          warehouseType: currentValue.warehouse.type,
          stock: 0,
        };
      accumulator[key].stock += currentValue.stock;
      return accumulator;
    }, {}),
  );

  if (includeBoxSizeDetail)
    product.stockByWarehouseAndBoxSize = Object.values(
      product.productBoxes.reduce((accumulator, currentValue) => {
        const key = `${currentValue.warehouseId}-${currentValue.boxSize}`;
        if (!_.get(accumulator, [key]))
          accumulator[key] = {
            warehouseId: currentValue.warehouse.id,
            warehouseName: currentValue.warehouse.name,
            warehouseType: currentValue.warehouse.type,
            boxSize: currentValue.boxSize,
            quantityBoxes: 0,
            completeBoxes: 0,
            stock: 0,
          };
        accumulator[key].stock += currentValue.stock;
        accumulator[key].quantityBoxes += 1;
        accumulator[key].completeBoxes +=
          currentValue.boxSize === currentValue.stock ? 1 : 0;
        return accumulator;
      }, {}),
    );

  product.productBoxes = undefined;
  return product;
};

Provider.hasMany(Product);
Product.belongsTo(Provider);

Family.hasMany(Product);
Product.belongsTo(Family);

Subfamily.hasMany(Product);
Product.belongsTo(Subfamily);

Element.hasMany(Product);
Product.belongsTo(Element);

Model.hasMany(Product);
Product.belongsTo(Model, { foreignKey: 'id' });

module.exports = { Product };
