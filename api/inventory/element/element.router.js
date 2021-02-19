const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./element.controller');
const Validator = require('./element.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'element'),
  celebrate(Validator.Get),
  Controller.getElement,
);
router.get(
  '/',
  isAble('read', 'element'),
  celebrate(Validator.List),
  Controller.listElements,
);
router.post(
  '/',
  isAble('create', 'element'),
  celebrate(Validator.Post),
  Controller.postElement,
);

module.exports = router;
