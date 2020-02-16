const Services = require('./elementService');

const getElement = async (req, res) => {
  const element = await Services.readElement(req.params);

  return res.status(element.status).send(element);
};

const listElements = async (req, res) => {
  const elements = await Services.listElements(req.query);

  return res.status(elements.status).send(elements);
};

const postElement = async (req, res) => {
  const element = await Services.createElement(req.body);

  return res.status(element.status).send(element);
};

module.exports = {
  getElement,
  listElements,
  postElement,
};
