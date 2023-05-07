const Services = require('./supply.service');

const getSupply = async (req, res) => {
  const supply = await Services.readSupply(req.params);

  return res.status(supply.status).send(supply);
};

const listSupplies = async (req, res) => {
  const supplies = await Services.listSupplies(req.query);

  return res.status(supplies.status).send(supplies);
};

const postSupply = async (req, res) => {
  const validate = await Services.validateCreateSupply(req.body);
  if (validate.status !== 200)
    return res.status(validate.status).send(validate);
  const supply = await Services.createSupply(req.body);

  return res.status(supply.status).send(supply);
};

const putSupply = async (req, res) => {
  const validation = await Services.validateUpdateSupply(req.body, req.params);

  if (validation.status !== 200)
    return res.status(validation.status).send(validation);

  const supply = await Services.updateSupply(
    req.body,
    req.params,
    validation.data,
  );

  return res.status(supply.status).send(supply);
};

const deleteSupply = async (req, res) => {
  const supply = await Services.deleteSupply(req.params);

  return res.status(supply.status).send(supply);
};

const putSupplyStatus = async (req, res) => {
  const supply = await Services.updateSupplyStatus(req.body, req.params);

  return res.status(supply.status).send(supply);
};

const updateAttendSuppliedProduct = async (req, res) => {
  const validate = await Services.validateAttendSuppliedProduct(
    req.body,
    req.params,
  );

  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const suppliedProduct = await Services.updateAttendSuppliedProduct(
    req.body,
    req.params,
    req.user,
  );

  if (suppliedProduct.status !== 200)
    return res.status(suppliedProduct.status).send(suppliedProduct);
  const supply = await Services.readSupply(req.params);
  return res.status(supply.status).send(supply);
};

const deleteAttendSuppliedProduct = async (req, res) => {
  const suppliedProduct = await Services.deleteAttendSuppliedProduct(
    req.params,
    req.user,
  );

  const supply = await Services.readSupply(req.params);
  return res.status(supply.status).send(supply);
};

const listSupplyLogs = async (req, res) => {
  const supplyLogs = await Services.listSupplyLogs(req.query);
  return res.status(supplyLogs.status).send(supplyLogs);
};

module.exports = {
  getSupply,
  listSupplies,
  postSupply,
  putSupply,
  deleteSupply,
  // * Others
  putSupplyStatus,
  updateAttendSuppliedProduct,
  deleteAttendSuppliedProduct,
  listSupplyLogs,
};
