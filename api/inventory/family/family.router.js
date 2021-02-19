const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./family.controller');
const Validator = require('./family.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'family'),
  celebrate(Validator.Get),
  Controller.getFamily,
);
router.get(
  '/',
  isAble('read', 'family'),
  celebrate(Validator.List),
  Controller.listFamilies,
);
router.post(
  '/',
  isAble('create', 'family'),
  celebrate(Validator.Post),
  Controller.postFamily,
);

module.exports = router;
