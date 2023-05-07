const Services = require('./product.service');
const {
  excelParserInventory,
  excelParserBulkUpload,
  excelParserBulkImagesUpload,
} = require('@/utils');

const getProduct = async (req, res) => {
  const product = await (req.query.noStock
    ? Services.readProductNoStock(req.params)
    : Services.readProduct(req.params));

  return res.status(product.status).send(product);
};

const listProducts = async (req, res) => {
  const products = await Services.listProducts(req.query);

  return res.status(products.status).send(products);
};

const listTradename = async (req, res) => {
  const products = await Services.listTradename(req.query);

  return res.status(products.status).send(products);
};

const postProduct = async (req, res) => {
  const validate = await Services.validatePost(req.body);
  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const categories = await Services.createCategories(req.body, validate.data);

  if (categories.status !== 201)
    return res.status(categories.status).send(categories);

  // * Solo se considera el model Id para crear el producto
  // * asumiendo una estructura de arbol
  const product = await Services.createProduct({
    ...req.body,
    modelId: categories.data.model.id,
  });

  return res.status(product.status).send(product);
};

const putProduct = async (req, res) => {
  const product = await Services.updateProduct(req.params, req.body);

  return res.status(product.status).send(product);
};

const postProductBase = async (req, res) => {
  const product = await Services.createProduct(req.body);

  return res.status(product.status).send(product);
};

const deleteProduct = async (req, res) => {
  const product = await Services.deleteProduct(req.params);
  return res.status(product.status).send(product);
};

const getInventoryReport = async (req, res) => {
  const response = await Services.getInventoryReport(req.query);
  return excelParserInventory(
    res,
    'Inventory',
    response.data.fields,
    response.data.data,
  );
};

const uploadCsvData = async (req, res) => {
  const csv = req.file;
  const response = await Services.uploadCsvProduct(req.params, csv);

  return excelParserBulkUpload(
    res,
    'Carga Masiva',
    response.data.fields,
    response.data.data,
  );
};

const uploadImages = async (req, res) => {
  const zip = req.file;
  const response = await Services.uploadImagesZip(req.params, zip);

  return excelParserBulkImagesUpload(
    res,
    'Caga Masiva de Imagenes',
    response.data.fields,
    response.data.data,
  );
};

module.exports = {
  getProduct,
  listProducts,
  listTradename,
  postProduct,
  putProduct,
  postProductBase,
  deleteProduct,
  getInventoryReport,
  uploadCsvData,
  uploadImages,
};
