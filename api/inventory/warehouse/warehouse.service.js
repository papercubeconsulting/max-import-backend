const { Warehouse } = require('@dbModels');

const { setResponse } = require('../../utils');

const readWarehouse = async reqParams => {
  const warehouse = await Warehouse.findByPk(reqParams.id);
  if (!warehouse) return setResponse(404, 'Warehouse not found.');

  return setResponse(200, 'Warehouse found.', warehouse);
};

const listWarehouses = async reqQuery => {
  const warehouses = await Warehouse.findAll({ where: reqQuery });
  return setResponse(200, 'Warehouses found.', warehouses);
};

const createWarehouse = async reqBody => {
  let warehouse = await Warehouse.findOne({ where: { name: reqBody.name } });
  if (warehouse) return setResponse(404, 'Warehouse already exists.');

  warehouse = await Warehouse.create(reqBody);

  return setResponse(201, 'Warehouse created.', warehouse);
};

module.exports = {
  readWarehouse,
  listWarehouses,
  createWarehouse,
};
