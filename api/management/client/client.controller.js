const Service = require('./client.service');

const getClient = async (req, res) => {
  let response = await Service.getClient({
    idNumber: req.params.identifier,
  });

  // ? Revisar si el id es menor a 9 digitos para asegurar el parsing
  if (response.status !== 200 && req.params.identifier.length < 9) {
    response = await Service.getClient({
      id: parseInt(req.params.identifier, 10),
    });
  }
  return res.status(response.status).send(response);
};

const listClient = async (req, res) => {
  const response = await Service.listClient(req.query);

  return res.status(response.status).send(response);
};

const postClient = async (req, res) => {
  const response = await Service.postClient(req.body);

  return res.status(response.status).send(response);
};

const updateClient = async (req, res) => {
  const response = await Service.updateClient(req.body, req.params);

  return res.status(response.status).send(response);
};

module.exports = {
  getClient,
  listClient,
  postClient,
  updateClient,
};
