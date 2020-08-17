/* eslint-disable no-unused-vars */
const { data: provinces } = require('./province');
const { data: regions } = require('./region');
const { data: districts } = require('./district');

const { setResponse } = require('../../utils');

const listRegions = reqParams => {
  const data = regions;
  return setResponse(200, 'Resources found', data);
};

const listProvinces = reqParams => {
  const data = provinces.filter(
    obj => obj.department_id === reqParams.regionId,
  );
  return setResponse(200, 'Resources found', data);
};

const listDistricts = reqParams => {
  const data = districts.filter(
    obj =>
      obj.province_id === reqParams.provinceId &&
      obj.department_id === reqParams.regionId,
  );
  return setResponse(200, 'Resources found', data);
};

module.exports = { listRegions, listProvinces, listDistricts };
