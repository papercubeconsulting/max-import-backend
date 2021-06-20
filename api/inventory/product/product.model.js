/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model: SeqModel, Op } = require('sequelize');

const { warehouseTypes } = require('@/utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Product extends SeqModel {
    // * CLASS METHODS
    static associate(models) {
      Product.belongsTo(models.Provider);
      Product.belongsTo(models.Family);
      Product.belongsTo(models.Subfamily);
      Product.belongsTo(models.Element);
      Product.belongsTo(models.Model, { foreignKey: 'id' });

      Product.hasMany(models.ProductBox);

      Product.hasMany(models.SuppliedProduct);
      Product.hasMany(models.ProformaProduct);
      Product.hasMany(models.SoldProduct);
      Product.hasMany(models.DispatchedProduct);
    }

    // ? Calcula stocks parciales por almacenes, tipos de almacenes y (almacenes-tamaño de caja)
    static aggregateStock(product, includeBoxSizeDetail = false) {
      product.totalStock = 0;
      product.stockByWarehouse = Object.values(
        product.productBoxes.reduce((accumulator, currentValue) => {
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
        }, {}),
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
            const key = `${currentValue.warehouse.id}-${currentValue.boxSize}`;
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
    }

    // ? Actualiza los campos availableStock y damagedStock de un producto
    static async updateStock(id, options) {
      const {
        productBox: ProductBox,
        warehouse: Warehouse,
        soldProduct: SoldProduct,
        dispatchedProduct: DispatchedProduct,
      } = this.sequelize.models;

      const product = await Product.findByPk(id, {
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
        transaction: _.get(options, 'transaction'),
      });

      if (!product) return;
      const summary = Product.aggregateStock(product.get());
      const damagedStock = _.get(
        summary.stockByWarehouseType.find(
          obj => obj.warehouseType === warehouseTypes.DAMAGED,
        ),
        'stock',
        0,
      );
      // ? Unidades vendidas
      const soldStock =
        (await SoldProduct.sum('quantity', {
          where: { productId: id },
          transaction: _.get(options, 'transaction'),
        })) || 0;

      // ? Unidades despachadas
      const dispatchedStock =
        (await DispatchedProduct.sum('dispatched', {
          where: { productId: id },
          transaction: _.get(options, 'transaction'),
        })) || 0;
      await product.update(
        {
          damagedStock,
          availableStock:
            summary.totalStock - damagedStock - (soldStock - dispatchedStock),
          dispatchStock: summary.totalStock - damagedStock,
        },
        { transaction: _.get(options, 'transaction') },
      );
    }

    // * INSTANCE METHODS
  }
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      familyName: {
        type: DataTypes.STRING,
      },
      subfamilyName: {
        type: DataTypes.STRING,
      },
      elementName: {
        type: DataTypes.STRING,
      },
      modelName: {
        type: DataTypes.STRING,
      },
      code: {
        type: DataTypes.STRING,
      },
      compatibility: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      tradename: {
        type: DataTypes.TEXT,
        defaultValue: '',
      },
      imageBase64: {
        type: DataTypes.BLOB,
        get() {
          return this.getDataValue('imageBase64')
            ? this.getDataValue('imageBase64').toString('utf8')
            : undefined;
        },
      },
      suggestedPrice: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      availableStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      damagedStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      dispatchStock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },

      modelId: DataTypes.INTEGER,
    },
    {
      sequelize,

      // options
      modelName: 'product',
      defaultScope: {
        attributes: { exclude: ['imageBase64'] },
      },
      scopes: {
        full: {},
      },
      hooks: {
        beforeCreate: async product => {
          const {
            element: Element,
            subfamily: Subfamily,
            family: Family,
            provider: Provider,
            model: Model,
          } = product.sequelize.models;
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
                      include: [
                        { model: Family, attributes: ['name', 'code'] },
                      ],
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
        },
      },
    },
  );

  return Product;
};
