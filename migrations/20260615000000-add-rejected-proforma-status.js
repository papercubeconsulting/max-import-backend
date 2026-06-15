const { PROFORMA } = require('../api/utils/constants');

const proformaNameType = 'enum_proformas_status';

module.exports = {
  up: async queryInterface => {
    const { value } = PROFORMA.STATUS.REJECTED;

    await queryInterface.sequelize.query(`
      ALTER TYPE "${proformaNameType}" ADD VALUE IF NOT EXISTS '${value}';
    `);
  },

  down: async () => {
    // PostgreSQL enum values cannot be removed safely without recreating the type.
  },
};
