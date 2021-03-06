const _ = require('lodash');
const winston = require('winston');
const { Proforma, ProformaProduct } = require('@dbModels');

const { sequelize } = require(`@root/startup/db`);
const { setResponse } = require('../../../utils');

const validatePutProforma = async reqParams => {
  const proforma = await Proforma.findByPk(reqParams.id);
  if (!proforma) return setResponse(404, 'Proforma not found.');

  return setResponse(200, 'OK');
};

const putProforma = async (reqParams, reqBody) => {
  const t = await sequelize.transaction();

  try {
    const proforma = await Proforma.findByPk(reqParams.id, {
      include: [ProformaProduct],
      transaction: t,
    });

    // * --------------------------------------------------------
    // ? Se eliminan los registros que no aparezcan en el query
    await Promise.all(
      proforma.proformaProducts
        .filter(
          dbObj =>
            !reqBody.proformaProducts.some(
              queryObj => queryObj.productId === dbObj.productId,
            ),
        )
        .map(async dbObj => dbObj.destroy({ transaction: t })),
    );

    // * --------------------------------------------------------
    // ? Para cada registro del query, se decide si es uno nuevo
    // ? o es uno existente que requiere actualizacion
    await Promise.all(
      reqBody.proformaProducts.map(async queryObj => {
        const proformaProduct = proforma.proformaProducts.find(
          dbObj => dbObj.productId === queryObj.productId,
        );
        // ? Se actualiza la instancia OR se crea una nueva

        if (proformaProduct)
          return proformaProduct.update(queryObj, { transaction: t });
        return proforma.createProformaProduct(queryObj, {
          transaction: t,
        });
      }),
    );

    // * --------------------------------------------------------
    await proforma.update(_.pick(reqBody, ['clientId', 'discount']), {
      transaction: t,
    });

    await t.commit();
    await proforma.reload();
    return setResponse(200, 'Proforma created.', proforma);
  } catch (error) {
    winston.error(error);

    await t.rollback();

    return setResponse(400, 'Proforma update failed.');
  }
};

module.exports = { validatePutProforma, putProforma };
