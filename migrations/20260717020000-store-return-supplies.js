module.exports = {
  async up(queryInterface, Sequelize) {
    const supplies = await queryInterface.describeTable('supplies');
    const suppliedProducts =
      await queryInterface.describeTable('suppliedProducts');

    if (!supplies.sourceWarehouseId) {
      await queryInterface.addColumn('supplies', 'sourceWarehouseId', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'warehouses', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
    }

    await queryInterface.changeColumn('supplies', 'providerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'providers', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    if (!suppliedProducts.cancelledQuantity) {
      await queryInterface.addColumn('suppliedProducts', 'cancelledQuantity', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
    }

    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_supplies_status"
      ADD VALUE IF NOT EXISTS 'Cerrado parcial';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_suppliedProducts_status"
      ADD VALUE IF NOT EXISTS 'Cerrado parcial';
    `);

    const indexes = await queryInterface.showIndex('supplies');
    if (
      !indexes.some(
        (index) => index.name === 'supplies_store_return_lookup_idx',
      )
    ) {
      await queryInterface.addIndex(
        'supplies',
        ['type', 'sourceWarehouseId', 'warehouseId', 'status'],
        { name: 'supplies_store_return_lookup_idx' },
      );
    }
  },

  async down(queryInterface, Sequelize) {
    const indexes = await queryInterface.showIndex('supplies');
    if (
      indexes.some((index) => index.name === 'supplies_store_return_lookup_idx')
    )
      await queryInterface.removeIndex(
        'supplies',
        'supplies_store_return_lookup_idx',
      );

    const suppliedProducts =
      await queryInterface.describeTable('suppliedProducts');
    if (suppliedProducts.cancelledQuantity)
      await queryInterface.removeColumn(
        'suppliedProducts',
        'cancelledQuantity',
      );

    const supplies = await queryInterface.describeTable('supplies');
    if (supplies.sourceWarehouseId)
      await queryInterface.removeColumn('supplies', 'sourceWarehouseId');

    const [nullProviders] = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS count FROM "supplies" WHERE "providerId" IS NULL;`,
    );
    if (Number(nullProviders[0].count) === 0) {
      await queryInterface.changeColumn('supplies', 'providerId', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'providers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      });
    }
    // PostgreSQL enum values are intentionally retained in down migrations.
  },
};
