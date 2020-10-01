const { Joi } = require('celebrate');

const ListRegions = {
  params: {},
};

const ListProvinces = {
  params: {
    regionId: Joi.string().required(),
  },
};

const ListDistricts = {
  params: {
    regionId: Joi.string().required(),
    provinceId: Joi.string().required(),
  },
};
module.exports = {
  ListRegions,
  ListProvinces,
  ListDistricts,
};
