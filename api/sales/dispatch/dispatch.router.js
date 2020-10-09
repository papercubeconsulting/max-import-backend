const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./dispatch.controller');
const Validator = require('./dispatch.validator');

const router = express.Router();

router.get('/', celebrate(Validator.List), Controller.listDispatch);
router.get('/:id', celebrate(Validator.Get), Controller.getDispatch);

router.post(
  '/:id/dispatchedProducts/:dispatchedProductId/dispatch',
  celebrate(Validator.PostDispatchProductBox),
  Controller.postDispatchProductBox,
);

module.exports = router;
