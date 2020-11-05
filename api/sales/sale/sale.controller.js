const Service = require('./sale.service');

const { jsonParser } = require('@/utils');

const listSale = async (req, res) => {
  const response = await Service.listSale(req.query);
  return res.status(response.status).send(response);
};

const getSale = async (req, res) => {
  const response = await Service.getSale(req.params);
  return res.status(response.status).send(response);
};

const postSale = async (req, res) => {
  // ? 1A. Se valida si el stock esta disponible
  // ? 1B. Se cierra la proforma
  // ? 2. Se genera la venta y se separa el stock
  const proformaResponse = await Service.closeProforma(req.body, req.user);
  return res.status(proformaResponse.status).send(proformaResponse);
};

const paySale = async (req, res) => {
  const validate = await Service.validatePaySale(req.params, req.body);
  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const response = await Service.paySale(req.params, req.body, req.user);
  return res.status(response.status).send(response);
};

const getSIGOSaleReport = async (req, res) => {
  const response = await Service.getSIGOSaleReport(req.query);

  return jsonParser(res, 'SIGO.csv', response.data.fields, response.data.data);
};

module.exports = { postSale, listSale, paySale, getSale, getSIGOSaleReport };
