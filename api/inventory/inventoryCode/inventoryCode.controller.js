const Service = require('./inventoryCode.service');
const resolve = async (req, res) => {
  const response = await Service.resolve(req.params);
  return res.status(response.status).send(response);
};
module.exports = { resolve };
