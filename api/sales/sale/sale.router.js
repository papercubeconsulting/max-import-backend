const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./sale.controller');
const Validator = require('./sale.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.post(
  '/',
  isAble('create', 'sale'),
  celebrate(Validator.Post),
  Controller.postSale,
);
router.get(
  '/',
  isAble('read', 'sale'),
  celebrate(Validator.List),
  Controller.listSale,
);
router.get(
  '/sigo',
  isAble('sigo', 'sale'),
  celebrate(Validator.GetSIGO),
  Controller.getSIGOSaleReport,
);
router.get(
  '/:id',
  isAble('read', 'sale'),
  celebrate(Validator.Get),
  Controller.getSale,
);
router.put(
  '/:id/pay',
  isAble('pay', 'sale'),
  celebrate(Validator.PutPay),
  Controller.paySale,
);

module.exports = router;
