'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('unitTicketPrints');
    if (!table.batchId) {
      await queryInterface.addColumn('unitTicketPrints', 'batchId', {
        type: Sequelize.UUID,
        allowNull: true,
      });
    }

    const indexes = await queryInterface.showIndex('unitTicketPrints');
    if (
      !indexes.some((index) => index.name === 'unit_ticket_prints_batch_idx')
    ) {
      await queryInterface.addIndex('unitTicketPrints', ['batchId'], {
        name: 'unit_ticket_prints_batch_idx',
      });
    }
  },

  async down(queryInterface) {
    const indexes = await queryInterface.showIndex('unitTicketPrints');
    if (indexes.some((index) => index.name === 'unit_ticket_prints_batch_idx'))
      await queryInterface.removeIndex(
        'unitTicketPrints',
        'unit_ticket_prints_batch_idx',
      );

    const table = await queryInterface.describeTable('unitTicketPrints');
    if (table.batchId)
      await queryInterface.removeColumn('unitTicketPrints', 'batchId');
  },
};
