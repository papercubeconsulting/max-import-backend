const { setResponse } = require('../../utils');

const { DeliveryAgency } = require('./deliveryAgency.model');

const getDeliveryAgency = async reqParams => {
  const deliveryAgency = await DeliveryAgency.findOne({ where: reqParams });
  if (!deliveryAgency) return setResponse(404, 'DeliveryAgency not found.');
  return setResponse(200, 'DeliveryAgency found.', deliveryAgency);
};

const listDeliveryAgency = async reqQuery => {
  const deliveryAgencies = await DeliveryAgency.findAll({ where: reqQuery });
  return setResponse(200, 'DeliveryAgency found.', deliveryAgencies);
};

const postDeliveryAgency = async reqBody => {
  let deliveryAgency = await DeliveryAgency.findOne({
    where: { name: reqBody.name },
  });
  if (deliveryAgency) return setResponse(400, 'DeliveryAgency already exists.');

  deliveryAgency = await DeliveryAgency.create(reqBody);

  return setResponse(200, 'DeliveryAgency created.', deliveryAgency);
};

module.exports = {
  getDeliveryAgency,
  listDeliveryAgency,
  postDeliveryAgency,
};
