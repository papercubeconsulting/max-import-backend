const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./client.controller');
const Validator = require('./client.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:identifier',
  isAble('read', 'client'),
  celebrate(Validator.Get),
  Controller.getClient,
);
router.get(
  '/',
  isAble('read', 'client'),
  celebrate(Validator.List),
  Controller.listClient,
);
router.post(
  '/',
  isAble('create', 'client'),
  celebrate(Validator.Post),
  Controller.postClient,
);
router.put(
  '/:id',
  isAble('update', 'client'),
  celebrate(Validator.Update),
  Controller.updateClient,
);

module.exports = router;
