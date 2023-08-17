const { setResponse } = require('@/utils');
const Service = require('./proforma.service');
const { update } = require('lodash');
// const { Proforma, ProformaProduct, DiscountProforma } = require('@dbModels');
// const {
//   isDiscountAllowed,
//   getDiscount,
//   getUserRole,
//   getValidateTransactionId,
//   canCurrentUserValidate,
//   getDiscountProforma,
// } = require('./proforma.service/discountProforma');

const getProforma = async (req, res) => {
  const response = await Service.getProforma(req.params);
  return res.status(response.status).send(response);
};

const postProforma = async (req, res) => {
  const validate = await Service.validateProforma(req.body);

  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const response = await Service.postProforma(req.body, req.user);
  // console.log({ id: response.id });
  const { id: proformaId } = response.data.get();
  // console.log({ proformaId, proforma: response.data.get() });
  const updatedResponse = await Service.updateResponseWithDiscountProformaId(
    proformaId,
    response,
  );
  return res.status(response.status).send(updatedResponse);
};

const putProforma = async (req, res) => {
  let validate = await Service.validateProforma(req.body);
  if (validate.status !== 200)
    return res.status(validate.status).send(validate);
  // console.log({user:req.user})
  validate = await Service.validatePutProforma(req.params);
  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const response = await Service.putProforma(req.params, req.body, req.user);

  // Get any discountProforma id for a proforma that is pending to validate
  // const { id: discountValidationId } =
  //   (await Service.getDiscountByProformaIdNoValidated(req.params.id)) || {};

  // response.data = { ...response.data.get(), discountValidationId };
  const updatedResponse = await Service.updateResponseWithDiscountProformaId(
    req.params.id,
    response,
  );

  return res.status(response.status).send(updatedResponse);
};

const listProforma = async (req, res) => {
  const response = await Service.listProforma(req.query);
  return res.status(response.status).send(response);
};

const sendPdfProforma = async (req, res) => {
  const { url } = req.body;
  const bearerToken = req.headers.authorization;
  res.setHeader('Content-Disposition', `attachment; filename="file.pdf"`);
  res.setHeader('Content-Type', 'application/pdf');
  const pdf = await Service.sendPdf(url, bearerToken, req);

  return res.send(pdf);
}

const validateDiscountProforma = async (req, res) => {
  const canUserValidateDiscount = Service.canCurrentUserValidate(req);
  if (!canUserValidateDiscount)
    return res
      .status(401)
      .send(setResponse('401', 'Permisos insuficientes para validar el error'));

  // console.log('allowed')
  const response = await Service.updateDiscountProforma(req);

  return res.status(response.status).send(response);
};

const getInfoValidationStatus = async (req, res) => {
  // console.log({Proforma,DiscountProforma})
  const { transactionId } = req.params;
  // console.log({ transactionId });
  const response = await Service.getDiscountProforma(transactionId);

  res.status(response.status).send(response);
};

  module.exports = {
    postProforma,
    putProforma,
    getProforma,
    listProforma,
    sendPdfProforma,
    validateDiscountProforma,
    getInfoValidationStatus,
  };
