const Services = require('./productService');

const getProduct = async (req, res) => {
  const product = await Services.readProduct(req.params);

  return res.status(product.status).send(product);
};

const listProducts = async (req, res) => {
  const products = await Services.listProducts(req.query);

  return res.status(products.status).send(products);
};

const postProduct = async (req, res) => {
  const product = await Services.createProduct(req.body);

  return res.status(product.status).send(product);
};

module.exports = {
  getProduct,
  listProducts,
  postProduct,
};
