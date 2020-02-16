const _ = require('lodash');

const { setResponse } = require('../../utils');

const Element = require('./elementModel');
const Subfamily = require('../subfamily/subfamilyModel');

const readElement = async reqBody => {
  const element = await Element.findByPk(reqBody.id);
  if (!element) return setResponse(400, 'Element not found.');

  return setResponse(200, 'Element found.', element);
};

const listElements = async reqQuery => {
  const elements = await Element.findAll({
    where: _.pick(reqQuery, ['subfamilyId']),
  });

  return setResponse(200, 'Elements found.', elements);
};

const createElement = async reqBody => {
  let element = await Element.findOne({
    where: { name: reqBody.name, subfamilyId: reqBody.subfamilyId },
  });
  if (element) return setResponse(400, 'Element already exists.');

  const subfamily = await Subfamily.findByPk(reqBody.subfamilyId);
  if (!subfamily) return setResponse(400, 'Subfamily does not exists.');

  element = await Element.create(reqBody);

  return setResponse(201, 'Element created.', element);
};

module.exports = {
  readElement,
  listElements,
  createElement,
};
