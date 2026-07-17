const { sequelize } = require(`@root/startup/db`);

const { Supply, SuppliedProduct, ProductBox, Product } = require('@dbModels');
const winston = require('winston');
const {
  supplyStatus: status,
  PRODUCTBOX_UPDATES,
  supplyTypes,
} = require('../../../utils/constants');
const { setResponse } = require('../../../utils');

const deleteAttendSuppliedProduct = async (reqParams, reqUser) => {
  console.log(reqParams);
  const t = await sequelize.transaction();
  try {
    const suppliedProduct = await SuppliedProduct.findByPk(
      reqParams.idSuppliedProduct,
      {
        transaction: t,
      },
    );
    if (!suppliedProduct) {
      await t.rollback();
      return setResponse(404, 'Supplied product not found.');
    }
    const supply = await Supply.findByPk(suppliedProduct.supplyId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (
      supply.type === supplyTypes.STORE_RETURN &&
      suppliedProduct.suppliedQuantity > 0
    ) {
      await t.rollback();
      return setResponse(
        400,
        'Store return item already attended.',
        null,
        'No se puede eliminar un producto de devolución que ya generó cajas.',
      );
    }

    if (
      suppliedProduct.status === status.PENDING &&
      suppliedProduct.suppliedQuantity === 0
    ) {
      await SuppliedProduct.destroy({
        where: { id: reqParams.idSuppliedProduct },
        transaction: t,
      });
    }
    // Cuano solo se emite una cierta cantidad de cajas
    if (
      suppliedProduct.status === status.PENDING &&
      suppliedProduct.quantity > suppliedProduct.suppliedQuantity
    ) {
      await ProductBox.destroy({
        where: { suppliedProductId: reqParams.idSuppliedProduct },
        transaction: t,
      });

      await Product.updateStock(suppliedProduct.productId, { transaction: t });

      await SuppliedProduct.destroy({
        where: { id: reqParams.idSuppliedProduct },
        transaction: t,
      });
    }

    if (suppliedProduct.status === status.ATTENDED) {
      await ProductBox.destroy({
        where: { suppliedProductId: reqParams.idSuppliedProduct },
        transaction: t,
      });

      await Product.updateStock(suppliedProduct.productId, { transaction: t });

      await SuppliedProduct.destroy({
        where: { id: reqParams.idSuppliedProduct },
        transaction: t,
      });
    }

    await t.commit();
    return setResponse(200, 'Delete supplied product attended.', {});
  } catch (error) {
    winston.error(error);
    // If the execution reaches this line, an error was thrown.
    // We rollback the transaction.
    await t.rollback();

    return setResponse(400, 'Detele attend  supplied productfailed.');
  }
};

module.exports = { deleteAttendSuppliedProduct };
