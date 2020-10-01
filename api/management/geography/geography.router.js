const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./geography.controller');
const Validator = require('./geography.validator');

const router = express.Router();

router.get(
  '/regions',
  celebrate(Validator.ListRegions),
  Controller.listRegions,
);
router.get(
  '/regions/:regionId/provinces',
  celebrate(Validator.ListProvinces),
  Controller.listProvinces,
);
router.get(
  '/regions/:regionId/provinces/:provinceId/districts',
  celebrate(Validator.ListDistricts),
  Controller.listDistricts,
);

module.exports = router;
