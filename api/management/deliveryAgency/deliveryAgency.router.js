const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./deliveryAgency.controller');
const Validator = require('./deliveryAgency.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'deliveryAgency'),
  celebrate(Validator.Get),
  Controller.getDeliveryAgency,
);
router.get(
  '/',
  isAble('read', 'deliveryAgency'),
  celebrate(Validator.List),
  Controller.listDeliveryAgency,
);
router.post(
  '/',
  isAble('read', 'deliveryAgency'),
  celebrate(Validator.Post),
  Controller.postDeliveryAgency,
);

module.exports = router;
