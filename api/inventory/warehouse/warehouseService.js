const { setResponse } = require('../../utils');

const Warehouse = require('./warehouseModel');

const readWarehouse = async reqBody => {
  const warehouse = await Warehouse.findByPk(reqBody.id);
  if (!warehouse) return setResponse(400, 'Warehouse not found.');

  return setResponse(200, 'Warehouse found.', warehouse);
};

const listWarehouses = async reqQuery => {
  const warehouses = await Warehouse.findAll({});

  return setResponse(200, 'Warehouses found.', warehouses);
};

const createWarehouse = async reqBody => {
  let warehouse = await Warehouse.findOne({ where: { name: reqBody.name } });
  if (warehouse) return setResponse(400, 'Warehouse already exists.');

  warehouse = await Warehouse.create(reqBody);

  return setResponse(201, 'Warehouse created.', warehouse);
};

module.exports = {
  readWarehouse,
  listWarehouses,
  createWarehouse,
};
