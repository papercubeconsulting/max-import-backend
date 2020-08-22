const Service = require('./sale.service');

const postSale = async (req, res) => {
  // ? 1A. Se valida si el stock esta disponible
  // ? 1B. Se cierra la proforma
  // ? 2. Se genera la venta y se separa el stock
  const proformaResponse = await Service.closeProforma(req.body, req.user);
  return res.status(proformaResponse.status).send(proformaResponse);
};

module.exports = { postSale };
