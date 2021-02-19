const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./subfamily.controller');
const Validator = require('./subfamily.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'subfamily'),
  celebrate(Validator.Get),
  Controller.getSubfamily,
);
router.get(
  '/',
  isAble('read', 'subfamily'),
  celebrate(Validator.List),
  Controller.listSubfamilies,
);
router.post(
  '/',
  isAble('create', 'subfamily'),
  celebrate(Validator.Post),
  Controller.postSubfamily,
);

module.exports = router;
