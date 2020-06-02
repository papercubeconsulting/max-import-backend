const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./productboxController');
const Validator = require('./productboxValidator');

const router = express.Router();

// router.get('/:id', celebrate(Validator.Get), Controller.getSupply);
router.get(
  `/:trackingCode`,
  celebrate(Validator.GetCode),
  Controller.getProductBoxByCode,
);

module.exports = router;
