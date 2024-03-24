const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./warehouse.controller');
const Validator = require('./warehouse.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'warehouse'),
  celebrate(Validator.Get),
  Controller.getWarehouse,
);
router.get(
  '/',
  isAble('read', 'warehouse'),
  celebrate(Validator.List),
  Controller.listWarehouses,
);
router.post(
  '/',
  isAble('create', 'warehouse'),
  celebrate(Validator.Post),
  Controller.postWarehouse,
);
router.get(
  '/trackingCode/:id',
  isAble('read', 'warehouse'),
  celebrate(Validator.GetByTrackingCode),
  Controller.getWarehouseByTrackingCode,
);
module.exports = router;
