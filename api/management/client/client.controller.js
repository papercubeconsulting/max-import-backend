const Service = require('./client.service');

const getClient = async (req, res) => {
  console.log(req.params);
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

module.exports = {
  getClient,
};
