/* eslint-disable no-param-reassign */
const { Model } = require('sequelize');

function pad(n, width, z) {
  z = z || '0';
  n += '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

// TODO
// Supply.hasMany(ProductBox);
// SuppliedProduct.hasMany(ProductBox);

module.exports = (sequelize, DataTypes) => {
  class ProductBox extends Model {
    static associate(models) {
      ProductBox.hasMany(models.ProductBoxLog);

      ProductBox.belongsTo(models.Product);
      ProductBox.belongsTo(models.Warehouse);
      ProductBox.belongsTo(models.Supply);
      ProductBox.belongsTo(models.SuppliedProduct);
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
    },
  );

  ProductBox.prototype.getTrackingCode = function() {
    return `1${pad(this.supplyId, 6)}${pad(this.suppliedProductId, 6)}${pad(
      this.indexFromSupliedProduct,
      3,
    )}`;
  };

  ProductBox.beforeCreate('generateCode', async (productBox, options) => {
    productBox.trackingCode = productBox.getTrackingCode();
  });

  ProductBox.beforeBulkCreate('generateCode', async (productBoxes, options) => {
    productBoxes.forEach((obj, index, array) => {
      array[index].trackingCode = array[index].getTrackingCode();
    });
  });

  // TODO: Update
  // ProductBox.prototype.registerLog = function(message, user) {
  //   ProductBoxLog.create({
  //     productBoxId: this.id,
  //     log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
  //     userId: user.id,
  //     warehouseId: this.warehouseId,
  //   });
  // };

  // ProductBox.bulkRegisterLog = function(message, user, data) {
  //   ProductBoxLog.bulkCreate(
  //     data.map(productBox => ({
  //       productBoxId: productBox.id,
  //       log: _.get(PRODUCTBOX_UPDATES, `${message}.name`, message),
  //       userId: user.id,
  //       warehouseId: productBox.warehouseId,
  //     })),
  //   );
  // };

  return ProductBox;
};
