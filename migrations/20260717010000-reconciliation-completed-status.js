module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "inventoryReconciliations"
      SET "status" = 'COMPLETED', "updatedAt" = NOW()
      WHERE "status" = 'APPROVED';
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      UPDATE "inventoryReconciliations"
      SET "status" = 'APPROVED', "updatedAt" = NOW()
      WHERE "status" = 'COMPLETED'
        AND "confirmedBy" IS NOT NULL;
    `);
  },
};
