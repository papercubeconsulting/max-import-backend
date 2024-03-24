module.exports = {
  up: async queryInterface => {
    await queryInterface.removeConstraint('warehouses', 'warehouses_name_key');
  },

  down: async queryInterface => {
    await queryInterface.addConstraint('warehouses', {
      fields: ['name'],
      type: 'unique',
      name: 'warehouses_name_key',
    });
  },
};
