/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('warehouses', 'subDivision', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('warehouses', 'trackingCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('warehouses', 'name', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: false, // Modify unique option
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('warehouses', 'subDivision');
    await queryInterface.removeColumn('warehouses', 'trackingCode');
    await queryInterface.changeColumn('warehouses', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true, // Revert unique option
    });
  },
};
