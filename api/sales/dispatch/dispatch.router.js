const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./dispatch.controller');
const Validator = require('./dispatch.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/',
  isAble('read', 'dispatch'),
  celebrate(Validator.List),
  Controller.listDispatch,
);
router.get(
  '/:id',
  isAble('read', 'dispatch'),
  celebrate(Validator.Get),
  Controller.getDispatch,
);

router.post(
  '/:id/dispatchedProducts/:dispatchedProductId/dispatch',
  isAble('dipatchProduct', 'dispatch'),
  celebrate(Validator.PostDispatchProductBox),
  Controller.postDispatchProductBox,
);

router.post(
  '/:id/finish',
  isAble('finish', 'dispatch'),
  Controller.postFinishDispatch,
);

module.exports = router;
