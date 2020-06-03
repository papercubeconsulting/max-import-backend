const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./productboxController');
const Validator = require('./productboxValidator');

const router = express.Router();

router.get('/:id([0-9]+)', celebrate(Validator.Get), Controller.getProductBox);
router.get(
  `/:trackingCode`,
  celebrate(Validator.GetCode),
  Controller.getProductBoxByCode,
);

router.put('/:id', celebrate(Validator.Put), Controller.putProductBox);

module.exports = router;
