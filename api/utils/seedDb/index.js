/* eslint-disable no-unused-vars */
const winston = require('winston');
const fs = require('fs');
const path = require('path');

require('../../../startup/config')();
require('../../../startup/logging')();

const sequelize = require('../../../startup/db');

const { Family } = require('../../inventory/family/family.model');
const { Subfamily } = require('../../inventory/subfamily/subfamily.model');
const { Element } = require('../../inventory/element/element.model');
const { Model } = require('../../inventory/model/model.model');
const { Provider } = require('../../inventory/provider/provider.model');
const { Warehouse } = require('../../inventory/warehouse/warehouse.model');

const { Product } = require('../../inventory/product/product.model');
const { Supply } = require('../../inventory/supply/supply.model');
const { User } = require('../../auth/user/user.model');
const { Client } = require('../../management/client/client.model');
const {
  DeliveryAgency,
} = require('../../management/deliveryAgency/deliveryAgency.model');
const { Proforma } = require('../../sales/proforma/proforma.model');
const { Sale } = require('../../sales/sale/sale.model');

const { _fullCreateSupply } = require('../../inventory/supply/supply.service');

const {
  _seedCreateProforma,
} = require('../../sales/proforma/proforma.service');

const { asyncForEach } = require('../../utils');
const { Bank } = require('../../management/bank/bank.model');
const { postBank } = require('../../management/bank/bank.service');

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
});
