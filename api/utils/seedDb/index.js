const winston = require('winston');
const fs = require('fs');
const path = require('path');

require('../../../startup/config')();
require('../../../startup/logging')();

const sequelize = require('../../../startup/db');

const Family = require('../../inventory/family/familyModel');
const Subfamily = require('../../inventory/subfamily/subfamilyModel');
const Element = require('../../inventory/element/elementModel');
const Model = require('../../inventory/model/modelModel');
const Provider = require('../../inventory/provider/providerModel');
const Warehouse = require('../../inventory/warehouse/warehouseModel');

const Product = require('../../inventory/product/productModel');
const { Supply } = require('../../inventory/supply/supplyModel');

const { fullCreateSupply } = require('../../inventory/supply/supplyService');
const { asyncForEach } = require('../../utils');

const seedModel = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));
  await model.bulkCreate(JSON.parse(rawdata), { individualHooks: true });
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

const seedModelOneByOne = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));

  await asyncForEach(JSON.parse(rawdata), async data => model.create(data));
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

const seedModelByService = async (model, filename, service) => {
  const rawData = fs.readFileSync(path.join(__dirname, filename));

  await asyncForEach(JSON.parse(rawData), async data => service(data));
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

sequelize.sync({ force: true }).then(async result => {
  await seedModel(Family, 'family.json');
  await seedModel(Subfamily, 'subfamily.json');
  await seedModel(Element, 'element.json');
  await seedModel(Model, 'model.json');

  await seedModel(Provider, 'provider.json');
  await seedModel(Warehouse, 'warehouse.json');

  // await seedModelOneByOne(Product, 'product.json');

  // await seedModelByService(Supply, 'supply.json', fullCreateSupply);

  await sequelize.close();
});
