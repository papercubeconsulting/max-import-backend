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

const seedModel = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));
  await model.bulkCreate(JSON.parse(rawdata));
  winston.info(`${model.tableName} seeded!`);
};

sequelize.sync({ force: true }).then(async result => {
  await seedModel(Family, 'family.json');
  await seedModel(Subfamily, 'subfamily.json');
  await seedModel(Element, 'element.json');
  await seedModel(Model, 'model.json');
});
