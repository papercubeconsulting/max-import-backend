const Service = require('./productboxService');

const getProductBox = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

const getProductBoxByCode = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

const getProductBoxByIdentifier = async (req, res) => {
  let response = await Service.getProductBox({
    trackingCode: req.params.identifier,
  });

  if (response.status !== 200) {
    response = await Service.getProductBox({
      id: parseInt(req.params.identifier, 10),
    });
  }
  return res.status(response.status).send(response);
};

const putProductBox = async (req, res) => {
  const response = await Service.putProductBox(req.body, req.params, req.user);
  return res.status(response.status).send(response);
};

module.exports = {
  getProductBox,
  getProductBoxByCode,
  putProductBox,
  getProductBoxByIdentifier,
};