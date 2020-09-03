const _ = require('lodash');
const { Element, Subfamily, Product } = require('@dbModels');

const { setResponse } = require('../../utils');

const readElement = async reqParams => {
  const element = await Element.findByPk(reqParams.id);
  if (!element) return setResponse(404, 'Element not found.');

  return setResponse(200, 'Element found.', element);
};

const listElements = async reqQuery => {
  const query = {
    where: _.pick(reqQuery, ['subfamilyId']),
  };
  if (reqQuery.providerId)
    query.include = [
      {
        model: Product,
        attributes: ['id', 'providerId', 'code'],
        where: { providerId: reqQuery.providerId },
      },
    ];

  const elements = await Element.findAll(query);

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
