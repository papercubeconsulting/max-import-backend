const Services = require('./warehouse.service');

const getWarehouse = async (req, res) => {
  const warehouse = await Services.readWarehouse(req.params);

  return res.status(warehouse.status).send(warehouse);
};

const getWarehouseByTrackingCode = async (req, res) => {
  const warehouse = await Services.getWarehouseByTrackingCode(req.params);
  return res.status(warehouse.status).send(warehouse);
};

const listWarehouses = async (req, res) => {
  const warehouses = await Services.listWarehouses(req.query);

  return res.status(warehouses.status).send(warehouses);
};

const postWarehouse = async (req, res) => {
  const warehouse = await Services.createWarehouse(req.body);

  return res.status(warehouse.status).send(warehouse);
};

module.exports = {
  getWarehouse,
  listWarehouses,
  postWarehouse,
  getWarehouseByTrackingCode,
};
