const Services = require('./product.service');

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

const listTradename = async(req,res)=>{
  const products = await Services.listTradename(req.query);
  
  return res.status(products.status).send(products);
}

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

module.exports = {
  getProduct,
  listProducts,
  listTradename,
  postProduct,
  putProduct,
  postProductBase,
  deleteProduct,
};
