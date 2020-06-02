const Service = require('./productboxService');

const getProductBoxByCode = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

module.exports = {
  getProductBoxByCode,
};
