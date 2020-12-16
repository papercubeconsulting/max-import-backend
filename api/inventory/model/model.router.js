const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./model.controller');
const Validator = require('./model.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'model'),
  celebrate(Validator.Get),
  Controller.getModel,
);
router.get(
  '/',
  isAble('read', 'model'),
  celebrate(Validator.List),
  Controller.listModels,
);
router.post(
  '/',
  isAble('create', 'model'),
  celebrate(Validator.Post),
  Controller.postModel,
);

module.exports = router;
