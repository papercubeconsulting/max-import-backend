'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    const hasProductGroupsTable = tables.includes('productGroups');

    if (!hasProductGroupsTable) {
      await queryInterface.createTable('productGroups', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        isActive: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
      });
    }

    const productsTable = await queryInterface.describeTable('products');
    if (productsTable.groupId) return;

    await queryInterface.addColumn('products', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'productGroups',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async queryInterface => {
    const tables = await queryInterface.showAllTables();

    if (tables.includes('products')) {
      const productsTable = await queryInterface.describeTable('products');
      if (productsTable.groupId)
        await queryInterface.removeColumn('products', 'groupId');
    }

    if (tables.includes('productGroups'))
      await queryInterface.dropTable('productGroups');
  },
};
