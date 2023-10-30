const { Proforma } = require('@dbModels');
// const { Sequelize, Model, DataTypes } = require('sequelize');
const { setResponse } = require('../../../utils');

const resetExpireProforma = async req => {
  const { id } = req.params;
  // const role = getUserRole(req);
  const proforma = await Proforma.findByPk(id);
  if (!proforma) return setResponse(404, 'Proforma not found.');

  // https://stackoverflow.com/questions/64250923/change-value-of-createdat-in-sequelize
  proforma.changed('createdAt', true);

  proforma.set('createdAt', new Date().toISOString(), { raw: true });

  await proforma.save({
    silent: true,
    fields: ['createdAt'],
  });
  // await proforma.update({
  //   createdAt: new Date().toISOString(),
  // });

  return setResponse(200, 'Proforma status reset expire time', proforma);
  // return proforma;

  // check for the user if it a valid discount
};

module.exports = {
  resetExpireProforma,
};
