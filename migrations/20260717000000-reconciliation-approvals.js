module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('inventoryReconciliations');

    if (!table.sources) {
      await queryInterface.addColumn('inventoryReconciliations', 'sources', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }

    await queryInterface.changeColumn('inventoryReconciliations', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('inventoryReconciliations');

    await queryInterface.changeColumn('inventoryReconciliations', 'status', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'COMPLETED',
    });

    if (table.sources) {
      await queryInterface.removeColumn('inventoryReconciliations', 'sources');
    }
  },
};
