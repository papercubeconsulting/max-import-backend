const { setResponse } = require('../../../utils');

const { Supply } = require('../supplyModel');

const deleteSupply = async reqParams => {
  const supply = await Supply.destroy({ where: { id: reqParams.id } });
  if (!supply) return setResponse(404, 'Supply not found.');

  return setResponse(200, 'Supply deleted.');
};

module.exports = { deleteSupply };
