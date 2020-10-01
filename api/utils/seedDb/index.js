/* eslint-disable no-unused-vars */
const winston = require('winston');
const fs = require('fs');
const path = require('path');
require('module-alias/register');

require('../../../startup/config')();
require('../../../startup/logging')();

const {
  sequelize,
  Family,
  Subfamily,
  Element,
  Model,
  Provider,
  Warehouse,
  Product,
  Supply,
  User,
  Client,
  DeliveryAgency,
  Proforma,
  Sale,
  Bank,
} = require('../../../startup/db');

const { _fullCreateSupply } = require('../../inventory/supply/supply.service');

const {
  _seedCreateProforma,
} = require('../../sales/proforma/proforma.service');

const { postBank } = require('../../management/bank/bank.service');

const { asyncForEach } = require('../../utils');

const seedModel = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));
  await model.bulkCreate(JSON.parse(rawdata));
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

const seedModelOneByOne = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));

  await asyncForEach(JSON.parse(rawdata), async data => model.create(data));
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

const seedModelByService = async (model, filename, service, params = []) => {
  const rawData = fs.readFileSync(path.join(__dirname, filename));

  await asyncForEach(JSON.parse(rawData), async data =>
    service(data, ...params),
  );
  winston.info(`${model.tableName} seeded!`);
  return 1;
};

sequelize.sync({ force: true }).then(async result => {
  try {
    await seedModel(User, 'user.json');
    await seedModel(Warehouse, 'warehouse.json');
    await seedModel(DeliveryAgency, 'deliveryAgency.json');
    await seedModelOneByOne(Client, 'client.json');
    await seedModelByService(Bank, 'bank.json', postBank);

    // await seedModel(Provider, 'provider.json');
    // await seedModel(Family, 'family.json');
    // await seedModel(Subfamily, 'subfamily.json');
    // await seedModel(Element, 'element.json');
    // await seedModelOneByOne(Model, 'model.json');
    // await seedModelOneByOne(Product, 'product.json');

    await seedModel(Provider, 'provider_v2.json');
    await seedModel(Family, 'family_v2.json');
    await seedModel(Subfamily, 'subfamily_v2.json');
    await seedModel(Element, 'element_v2.json');
    await seedModelOneByOne(Model, 'model_v2.json');
    await seedModelOneByOne(Product, 'product_v2.json');

    await seedModelByService(Supply, 'supply.json', _fullCreateSupply, [
      { id: 1, name: 'Test' },
    ]);

    await seedModelByService(Proforma, 'proforma.json', _seedCreateProforma);

    await sequelize.close();
  } catch (error) {
    await sequelize.close();
  }
});
