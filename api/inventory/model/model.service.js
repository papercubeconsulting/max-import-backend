const _ = require('lodash');

const { setResponse } = require('../../utils');

const { Model } = require('./model.model');
const { Element } = require('../element/element.model');
const { Product } = require('../product/product.model');

const readModel = async reqParams => {
  const model = await Model.findByPk(reqParams.id);
  if (!model) return setResponse(404, 'Model not found.');

  return setResponse(200, 'Model found.', model);
};

const listModels = async reqQuery => {
  const query = {
    where: _.pick(reqQuery, ['elementId']),
  };
  if (reqQuery.providerId)
    query.include = [
      {
        model: Product,
        attributes: ['id', 'providerId', 'code'],
        where: { providerId: reqQuery.providerId },
      },
    ];
  const models = await Model.findAll(query);

  return setResponse(200, 'Models found.', models);
};

const createModel = async reqBody => {
  let model = await Model.findOne({
    where: { name: reqBody.name, elementId: reqBody.elementId },
  });
  if (model) return setResponse(400, 'Model already exists.');

  const element = await Element.findByPk(reqBody.elementId);
  if (!element) return setResponse(400, 'Element does not exists.');

  model = await Model.create(reqBody);

  return setResponse(201, 'Model created.', model);
};

module.exports = {
  readModel,
  listModels,
  createModel,
};
