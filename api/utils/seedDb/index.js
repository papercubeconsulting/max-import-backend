const winston = require('winston');
const fs = require('fs');
const path = require('path');

require('../../../startup/config')();
require('../../../startup/logging')();

const sequelize = require('../../../startup/db');

const Family = require('../../inventory/family/familyModel');
const Subfamily = require('../../inventory/subfamily/subfamilyModel');
const Element = require('../../inventory/element/elementModel');

const seedModel = async (model, filename) => {
  const rawdata = fs.readFileSync(path.join(__dirname, filename));
  await model.bulkCreate(JSON.parse(rawdata));
  winston.info(`${model.tableName} seeded!`);
};

sequelize.sync({ force: true }).then(result => {
  seedModel(Family, 'family.json');
  seedModel(Subfamily, 'subfamily.json');
  seedModel(Element, 'element.json');
});
