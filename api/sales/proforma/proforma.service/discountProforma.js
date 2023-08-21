const _ = require('lodash');
const {
  DiscountProforma,
  Proforma,
  ProformaProduct,
  Product,
  User,
} = require('../../../../startup/db');

const { sequelize } = require(`@root/startup/db`);
const { setResponse, ROLES } = require('../../../utils');

const isDiscountAllowed = (discount, userRole) => {
  const DEFAULT_DISCOUNT = 5;
  const maxDiscount =
    ROLES[userRole].maxDiscount === null
      ? 100
      : ROLES[userRole].maxDiscount || DEFAULT_DISCOUNT;

  return maxDiscount >= discount;
};

const getValidateTransactionId = async proformaId => {
  try {
    const discountProforma = await DiscountProforma.create({
      proformaId,
    });

    return discountProforma.dataValues.id;
  } catch (error) {
    return setResponse(500, 'Failed getting discount proforma');
  }
};

const getDiscount = req => {
  return _.get(req.body, ['discount']);
};

const getDiscountPercentage = req => {
  return _.get(req.body, ['discountPercentage']);
};

const getUserRole = req => {
  return _.get(req.user, ['dataValues', 'role']);
};

const getUserId = req => {
  return _.get(req.user, ['dataValues', 'id']);
};

const getUserName = req => {
  return _.get(req.user, ['dataValues', 'name']);
};

const canCurrentUserValidate = req => {
  const allowedRolesCanValidate = ['superuser', 'manager'];
  const role = getUserRole(req);
  return true && allowedRolesCanValidate.includes(role);
};

const updateDiscountProforma = async req => {
  const discountPercentage = getDiscountPercentage(req);
  const role = getUserRole(req);
  const t = await sequelize.transaction();
  try {
    const isAllowed = isDiscountAllowed(discountPercentage * 100, role);

    if (!isAllowed) {
      return setResponse(
        401,
        'Permisos insuficientes para validar la proforma',
      );
    }

    const { transactionId } = req.params;

    const discountProforma = await DiscountProforma.findByPk(transactionId, {
      include: [Proforma],
      transaction: t,
    });

    if (!discountProforma) {
      await t.commit();
      return setResponse(404, 'DiscountProforma record not found.');
    }

    // update the user who validate by id
    await discountProforma.update(
      {
        userId: getUserId(req),
      },
      { transaction: t },
    );

    // update the status of the proforma to OPEN
    await Proforma.update(
      { status: 'OPEN' },
      {
        where: {
          id: discountProforma.proformaId,
        },
      },
    );

    await t.commit();
    await discountProforma.reload();
    return setResponse(
      204,
      'Proforma was validated successfully .',
      discountProforma,
    );
  } catch (error) {
    // console.log(error);
    await t.rollback();
    return setResponse(400, 'Proforma wasnt validated successfully.');
  }
};

const getDiscountByProformaIdNoValidated = async proformaId => {
  const discountProforma = await DiscountProforma.findOne({
    where: { proformaId, userId: null },
  });
  // console.log({ discountProforma });
  return discountProforma && discountProforma.dataValues;
};

// Retrieve all the info related to the discount trasnaction proforma
const getDiscountProforma = async id => {
  // console.log({ db });
  try {
    const discountProforma = await DiscountProforma.findByPk(id, {
      include: [
        {
          all: true,
        },
        {
          model: Proforma,
          include: [
            {
              model: ProformaProduct,
              include: {
                model: Product,
              },
            },
            {
              model: User,
            },
          ],
        },
      ],
    });
    if (!discountProforma) {
      return setResponse(404, "There's not profroma to valid for that id");
    }

    return setResponse(
      200,
      'Validation for the proforma found',
      discountProforma,
    );
  } catch (error) {
    return setResponse(500, 'Internal error gettin the discount proforma');
  }
};

const updateResponseWithDiscountProformaId = async (
  proformaId,
  responseProforma,
) => {
  const { id: discountValidationId } =
    (await getDiscountByProformaIdNoValidated(proformaId)) || {};

  return {
    ...responseProforma,
    data: {
      ...responseProforma.data.get(),
      discountValidationId,
    },
  };
};

module.exports = {
  isDiscountAllowed,
  getDiscount,
  getUserRole,
  getUserId,
  getUserName,
  getValidateTransactionId,
  getDiscountPercentage,
  canCurrentUserValidate,
  updateDiscountProforma,
  getDiscountProforma,
  getDiscountByProformaIdNoValidated,
  updateResponseWithDiscountProformaId,
};
