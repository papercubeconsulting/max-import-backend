/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-param-reassign */
const Sequelize = require('sequelize');

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
      type: Sequelize.STRING,
    },
    compatibility: {
      type: Sequelize.TEXT,
      defaultValue: '',
    },
    imagePath: {
      type: Sequelize.STRING,
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
});

Product.beforeSave('SetCategories', async (product, options) => {
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

Family.hasMany(Product);
Product.belongsTo(Family);

Subfamily.hasMany(Product);
Product.belongsTo(Subfamily);

Element.hasMany(Product);
Product.belongsTo(Element);

Model.hasMany(Product);
Product.belongsTo(Model, { foreignKey: 'id' });

module.exports = Product;
