'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable(
      'inventoryReconciliations',
    );
    if (!table.mode) {
      await queryInterface.addColumn('inventoryReconciliations', 'mode', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'GLOBAL_COUNT',
      });
    }

    const indexes = await queryInterface.showIndex('inventoryReconciliations');
    if (
      !indexes.some(
        (index) => index.name === 'inventory_reconciliations_mode_status_idx',
      )
    ) {
      await queryInterface.addIndex(
        'inventoryReconciliations',
        ['mode', 'status', 'productId'],
        { name: 'inventory_reconciliations_mode_status_idx' },
      );
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('inventoryReconciliations');
    if (
      indexes.some(
        (index) => index.name === 'inventory_reconciliations_mode_status_idx',
      )
    )
      await queryInterface.removeIndex(
        'inventoryReconciliations',
        'inventory_reconciliations_mode_status_idx',
      );

    const table = await queryInterface.describeTable(
      'inventoryReconciliations',
    );
    if (table.mode)
      await queryInterface.removeColumn('inventoryReconciliations', 'mode');
  },
};
