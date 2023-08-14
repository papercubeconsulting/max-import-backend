// 'use strict';

const { PROFORMA } = require('../api/utils/constants');

const proformaNameType = 'enum_proformas_status';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // https://github.com/sequelize/sequelize/issues/7151
    // https://www.michael1e.com/sequelize-enum-migration/
    // after adding the enum you cannot remove it later
    const { value } = PROFORMA.STATUS.PENDING_DISCOUNT_APPROVAL;
    await queryInterface.sequelize.query(
      `ALTER TYPE "${proformaNameType}" ADD VALUE '${value}'`,
    );
    // await queryInterface.changeColumn('proformas', 'status', {
    //   type: Sequelize.ENUM(getDictValues(PROFORMA.STATUS)),
    // defaultValue: PROFORMA.STATUS.PENDING_DISCOUNT_APPROVAL.value,
    // });
  },

  async down(queryInterface) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    const { value } = PROFORMA.STATUS.PENDING_DISCOUNT_APPROVAL;

    await queryInterface.sequelize.query(`
        DELETE 
        FROM
            pg_enum
        WHERE
            enumlabel = '${value}' AND
            enumtypid = (
                SELECT
                    oid
                FROM
                    pg_type
                WHERE
                    typname = '${proformaNameType}'
            )
    `);
  },
};
