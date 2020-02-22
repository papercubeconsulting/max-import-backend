const { setResponse } = require('../../utils');

const Family = require('./familyModel');

const readFamily = async reqParams => {
  const family = await Family.findByPk(reqParams.id);
  if (!family) return setResponse(400, 'Family not found.');

  return setResponse(200, 'Family found.', family);
};

const listFamilies = async reqQuery => {
  const families = await Family.findAll({});

  return setResponse(200, 'Families found.', families);
};

const createFamily = async reqBody => {
  let family = await Family.findOne({ where: { name: reqBody.name } });
  if (family) return setResponse(400, 'Family already exists.');

  family = await Family.create(reqBody);

  return setResponse(201, 'Family created.', family);
};

module.exports = {
  readFamily,
  listFamilies,
  createFamily,
};
