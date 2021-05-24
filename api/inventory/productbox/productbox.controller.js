const Service = require('./productbox.service');
const { excelParserProductBox, } = require('@/utils');

const getProductBox = async (req, res) => {
  const response = await Service.getProductBox(req.params);
  return res.status(response.status).send(response);
};

const listProductBoxs = async (req, res) => {
  const productBoxs = await Service.listProductBoxes(req.query);
  return res.status(productBoxs.status).send(productBoxs);
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

const putMoveProductBox = async (req, res) => {
  const response = await Service.putMoveProductBoxes(req.body, req.user);
  return res.status(response.status).send(response);
};

const putProductBox = async (req, res) => {
  const response = await Service.putProductBox(req.body, req.params, req.user);
  return res.status(response.status).send(response);
};

const getAvailableReport = async (req, res) => {
  const response = await Service.getAvailableReport(req.query);

  return excelParserProductBox(
    res,
    'AVAILABLE',
    response.data.fields,
    response.data.data,
  );
};

module.exports = {
  getProductBox,
  getProductBoxByCode,
  putProductBox,
  putMoveProductBox,
  getProductBoxByIdentifier,
  listProductBoxs,
  getAvailableReport,
};
