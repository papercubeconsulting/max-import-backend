module.exports = {
  up: async queryInterface => {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sales_billingType" ADD VALUE IF NOT EXISTS 'INVOICE';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_sales_billingType" ADD VALUE IF NOT EXISTS 'PROFORMA';
    `);
  },

  down: async () => {
    // PostgreSQL enum values cannot be removed safely without recreating the type.
  },
};
