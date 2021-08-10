const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./productbox.controller');
const Validator = require('./productbox.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/availableReport',
  isAble('read', 'productBox'),
  Controller.getAvailableReport,
);

router.get(
  '/movementReport',
  isAble('read', 'productBox'),
  Controller.getMovementReport,
);

router.get(
  '/:identifier',
  isAble('read', 'productBox'),
  celebrate(Validator.Get),
  Controller.getProductBoxByIdentifier,
);

router.get(
  '/',
  isAble('read', 'productBox'),
  celebrate(Validator.List),
  Controller.listProductBoxs,
);

router.put(
  '/move',
  isAble('read', 'productBox'),
  celebrate(Validator.PutMove),
  Controller.putMoveProductBox,
);

router.put(
  '/:id',
  isAble('read', 'productBox'),
  celebrate(Validator.Put),
  Controller.putProductBox,
);

module.exports = router;
