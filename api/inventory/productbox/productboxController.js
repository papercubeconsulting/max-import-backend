const Service = require('./productboxService');

const getProductBox = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

const getProductBoxByCode = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

const putProductBox = async (req, res) => {
  const response = await Service.putProductBox(req.body, req.params);
  return res.status(response.status).send(response);
};

module.exports = {
  getProductBox,
  getProductBoxByCode,
  putProductBox,
};
