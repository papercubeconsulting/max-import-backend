/* eslint-disable import/no-dynamic-require */
const _ = require('lodash');
const sequelize = require(`@root/startup/db`);

const { setResponse, paginate } = require('../../utils');

const { Proforma, ProformaProduct } = require('../proforma/proforma.model');
const { Product } = require('../../inventory/product/product.model');
const { Client } = require('../../management/client/client.model');

const { Sale } = require('./sale.model');

const { PROFORMA } = require('../../utils/constants');

const noQueryFields = ['page', 'pageSize'];

const closeProforma = async (reqBody, reqUser) => {
  const t = await sequelize.transaction();

  try {
    const proforma = await Proforma.findByPk(reqBody.proformaId, {
      transaction: t,
    });
    // ? Se valida que el estado de la proforma no haya pasado a cerrada
    if (proforma.status === PROFORMA.STATUS.CLOSED.value) {
      await t.commit();
      return setResponse(
        400,
        'Proforma already closed',
        null,
        'La proforma ya ha sido cerrada.',
      );
    }

    // ? Se valida el stock de los productos
    const check = await proforma.checkStock({ transaction: t });
    if (!check) {
      await t.commit();
      return setResponse(
        400,
        'No stock available.',
        null,
        'No hay stock para alguno de los productos, actualice para validar el stock disponible.',
      );
    }

    // ? Se procede a cerrar la proforma

    await proforma.closeProforma(
      { ...reqBody, sellerId: reqUser.id },
      { transaction: t },
    );

    // TODO: Remover
    const sale = await proforma.getSale({
      include: { all: true },
      transaction: t,
    });

    await t.commit();
    return setResponse(200, 'Proforma sold.', sale);
  } catch (error) {
    console.log(error);
    await t.rollback();
    return setResponse(400, 'Proforma sale failed.');
  }
};

const listSale = async reqQuery => {
  const sales = await Sale.findAndCountAll({
    where: _.omit(reqQuery, noQueryFields),
    order: [['createdAt', 'ASC']],
    include: [{ model: Proforma, include: [Client] }],
    distinct: true,
    ...paginate(_.pick(reqQuery, ['page', 'pageSize'])),
  });
  sales.page = reqQuery.page;
  sales.pageSize = reqQuery.pageSize;
  sales.pages = _.ceil(sales.count / sales.pageSize);
  return setResponse(200, 'Sales found.', sales);
};

module.exports = {
  closeProforma,
  listSale,
};
