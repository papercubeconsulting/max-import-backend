/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');
const _ = require('lodash');

const sequelize = require(`${process.cwd()}/startup/db`);

const Family = require('../family/familyModel');
const Subfamily = require('../subfamily/subfamilyModel');
const Element = require('../element/elementModel');
const Model = require('../model/modelModel');

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
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    compatibility: {
      type: Sequelize.TEXT,
      defaultValue: '',
    },
    imagePath: {
      type: Sequelize.STRING,
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
  },
  {
    // options
  },
);

Product.beforeCreate('SetId', async (product, options) => {
  product.id = product.modelId;
  const categories = await Model.findOne({
    attributes: ['name', 'elementId'],
    where: { id: product.modelId },
    include: [
      {
        model: Element,
        attributes: ['name', 'subfamilyId'],
        include: [
          {
            model: Subfamily,
            attributes: ['name', 'familyId'],
            include: [{ model: Family, attributes: ['name'] }],
          },
        ],
      },
    ],
  });

  product.modelName = categories.name;

  product.elementId = categories.elementId;
  product.elementName = categories.element.name;

  product.subfamilyId = categories.element.subfamilyId;
  product.subfamilyName = categories.element.subfamily.name;

  product.familyId = categories.element.subfamily.familyId;
  product.familyName = categories.element.subfamily.family.name;
});

// Product.beforeSave('SetCategories', async (product, options) => {

// });

Product.prototype.aggregateStock = function(includeBoxSizeDetail = false) {
  const that = this.get();
  that.totalStock = 0;
  that.stockByWarehouse = Object.values(
    that.productBoxes.reduce(
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
        that.totalStock += currentValue.stock;
        return accumulator;
      },
      {},
    ),
  );

  that.stockByWarehouseType = Object.values(
    that.productBoxes.reduce(
      (accumulator, currentValue, currentIndex, array) => {
        const key = currentValue.warehouse.type;
        if (!_.get(accumulator, [key]))
          accumulator[key] = {
            warehouseType: currentValue.warehouse.type,
            stock: 0,
          };
        accumulator[key].stock += currentValue.stock;
        return accumulator;
      },
      {},
    ),
  );

  if (includeBoxSizeDetail)
    that.stockByWarehouseAndBoxSize = Object.values(
      that.productBoxes.reduce(
        (accumulator, currentValue, currentIndex, array) => {
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
        },
        {},
      ),
    );

  that.productBoxes = undefined;
  return that;
};

Family.hasMany(Product);
Product.belongsTo(Family);

Subfamily.hasMany(Product);
Product.belongsTo(Subfamily);

Element.hasMany(Product);
Product.belongsTo(Element);

Model.hasMany(Product);
Product.belongsTo(Model, { foreignKey: 'id' });

module.exports = Product;
