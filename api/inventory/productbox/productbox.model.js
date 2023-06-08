/* eslint-disable no-param-reassign */
const _ = require('lodash');
const { Model } = require('sequelize');

const { PRODUCTBOX_UPDATES } = require('@/utils/constants');

function pad(n, width, z) {
  z = z || '0';
  n += '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

module.exports = (sequelize, DataTypes) => {
  class ProductBox extends Model {
    // * CLASS METHODS
    static associate(models) {
      ProductBox.hasMany(models.ProductBoxLog);

      ProductBox.belongsTo(models.Product);
      ProductBox.belongsTo(models.Warehouse);
      ProductBox.belongsTo(models.Warehouse, {
        as: 'previousWarehouse',
        foreignKey: 'previousWarehouseId',
      });
      ProductBox.belongsTo(models.Supply);
      ProductBox.belongsTo(models.SuppliedProduct);

      ProductBox.hasMany(models.DispatchedProductBox);
    }

    static bulkRegisterLog(message, user, data) {
      const { productBoxLog: ProductBoxLog } = this.sequelize.models;
      ProductBoxLog.bulkCreate(
        data.map(productBox => ({
          productBoxId: productBox.id,
          log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
          userId: _.get(user, 'id', user),
          warehouseId: productBox.warehouseId,
        })),
      );
    }

    // * INSTANCE METHODS
    getTrackingCode() {
      return `1${pad(this.supplyId, 6)}${pad(this.suppliedProductId, 6)}${pad(
        this.indexFromSupliedProduct,
        3,
      )}`;
    }

    registerLog(message, user, options) {
      const { productBoxLog: ProductBoxLog } = this.sequelize.models;
      return ProductBoxLog.create(
        {
          productBoxId: this.id,
          log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
          userId: _.get(user, 'id', user),
          warehouseId: this.warehouseId,
        },
        { transaction: _.get(options, 'transaction') },
      );
    }
  }
  ProductBox.init(
    {
      indexFromSupliedProduct: {
        // ? Correlativo asociado a supply
        type: DataTypes.INTEGER,
      },
      trackingCode: {
        // ? Codigo de seguimiento
        type: DataTypes.STRING,
      },
      boxSize: {
        // ? Tamano de la caja - Cantidad original de productos
        type: DataTypes.INTEGER,
      },
      stock: {
        // ? Cantidad actual de productos
        type: DataTypes.INTEGER,
      },
      isAvailable: {
        // ? Indica si existen productos disponibles | stock === 0
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,

      modelName: 'productBox',
      // options
      indexes: [
        {
          unique: true,
          fields: ['suppliedProductId', 'indexFromSupliedProduct'],
        },
        {
          fields: ['trackingCode'],
        },
      ],
      hooks: {
        // ? Generar codigo de identificacion de la caja
        beforeCreate: async productBox => {
          productBox.trackingCode = productBox.getTrackingCode();
        },
        beforeBulkCreate: async productBoxes => {
          productBoxes.forEach((obj, index, array) => {
            array[index].trackingCode = array[index].getTrackingCode();
          });
        },
      },
    },
  );

  return ProductBox;
};
