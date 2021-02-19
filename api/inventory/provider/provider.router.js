const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./provider.controller');
const Validator = require('./provider.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'provider'),
  celebrate(Validator.Get),
  Controller.getProvider,
);
router.get(
  '/',
  isAble('read', 'provider'),
  celebrate(Validator.List),
  Controller.listProviders,
);
router.post(
  '/',
  isAble('create', 'provider'),
  celebrate(Validator.Post),
  Controller.postProvider,
);

module.exports = router;
