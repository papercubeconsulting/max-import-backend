const _ = require('lodash');

const { setResponse } = require('../../utils');

const Subfamily = require('./subfamilyModel');

const readSubfamily = async reqBody => {
  const subfamily = await Subfamily.findByPk(reqBody.id);
  if (!subfamily) return setResponse(400, 'Subfamily not found.');

  return setResponse(200, 'Subfamily found.', subfamily);
};

const listSubfamilies = async reqQuery => {
  const subfamilies = await Subfamily.findAll({
    where: _.pick(reqQuery, ['familyId']),
  });

  return setResponse(200, 'Subfamilies found.', subfamilies);
};

const createSubfamily = async reqBody => {
  let subfamily = await Subfamily.findOne({
    where: { name: reqBody.name, familyId: reqBody.familyId },
  });
  if (subfamily) return setResponse(400, 'Subfamily already exists.');

  subfamily = await Subfamily.create(reqBody);

  return setResponse(201, 'Subfamily created.', subfamily);
};

module.exports = {
  readSubfamily,
  listSubfamilies,
  createSubfamily,
};
