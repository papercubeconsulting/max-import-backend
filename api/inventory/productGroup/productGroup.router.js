const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./productGroup.controller');
const Validator = require('./productGroup.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/suggest-code',
  isAble('read', 'productGroup'),
  celebrate(Validator.SuggestCode),
  Controller.suggestProductGroupCode,
);
router.get(
  '/:id',
  isAble('read', 'productGroup'),
  celebrate(Validator.Get),
  Controller.getProductGroup,
);
router.get(
  '/',
  isAble('read', 'productGroup'),
  celebrate(Validator.List),
  Controller.listProductGroups,
);
router.post(
  '/',
  isAble('create', 'productGroup'),
  celebrate(Validator.Post),
  Controller.postProductGroup,
);
router.put(
  '/:id',
  isAble('update', 'productGroup'),
  celebrate(Validator.Put),
  Controller.putProductGroup,
);

module.exports = router;
