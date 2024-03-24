const csv = require('csvtojson');
const fs = require('fs');
const { Warehouse, Provider, Product } = require('@dbModels');
const _ = require('lodash');
const moment = require('moment-timezone');
const { validateCreateSupply, createSupply } = require('./createSupply');
const { setResponse } = require('../../../utils');

const uploadCsvSupply = async (reqParams, file, reqUser) => {
  const columnsOutput = [];

  const supplyData = await csv({ delimiter: [';', ','] }).fromFile(file.path);

  fs.unlinkSync(file.path);

  const provider = await Provider.findOne({
    where: { name: supplyData[0].proveedor },
  });

  const warehouse = await Warehouse.findOne({
    where: { name: supplyData[0].almacen },
  });

  if (!warehouse && !provider) {
    return setResponse(400, 'Invalid Request.');
  }

  const slicedArray = _.slice(supplyData, 3);

  const productsSupply = _.map(slicedArray, item => {
    const newItem = _.pick(item, ['field5', 'field6', 'field7']); // Removing 'properties'
    return _.mapKeys(newItem, (value, key) => {
      if (key === 'field5') return 'productCode'; // Changing
      if (key === 'field6') return 'quantity';
      if (key === 'field7') return 'boxSize';
      return key;
    });
  });

  for (let i = 0; i < productsSupply.length; i += 1) {
    const product = await Product.findOne({
      where: { code: productsSupply[i].productCode },
    });
    productsSupply[i].productId = product.id;
  }

  const reqBody = {};
  reqBody.providerId = provider.id;
  reqBody.warehouseId = warehouse.id;
  reqBody.observations = '';
  reqBody.code = supplyData[0].code || '';
  reqBody.suppliedProducts = productsSupply;

  // handle date
  const parsedDate = moment(supplyData[0].fecha, 'DD/MM/YYYY')
    .tz('America/Lima')
    .add(5, 'hours');
  const formattedDate = parsedDate.format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
  reqBody.arrivalDate = formattedDate;

  const validate = await validateCreateSupply(reqBody);
  if (validate.status !== 200) {
    console.log('Inalid Request');
    return setResponse(400, 'Invalid Request.');
  }

  const supply = await createSupply(reqBody, reqUser);

  const rowProducts = _.map(productsSupply, obj => _.omit(obj, 'productId'));

  return setResponse(200, 'Products upload', {
    fields: columnsOutput,
    data: rowProducts,
    supply,
  });
};

module.exports = {
  uploadCsvSupply,
};
