const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./supply.controller');
const Validator = require('./supply.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'supply'),
  celebrate(Validator.Get),
  Controller.getSupply,
);

router.get(
  '/',
  isAble('read', 'supply'),
  celebrate(Validator.List),
  Controller.listSupplies,
);

router.post(
  '/',
  isAble('create', 'supply'),
  celebrate(Validator.Post),
  Controller.postSupply,
);

router.put(
  '/:id/status',
  isAble('attend', 'supply'),
  celebrate(Validator.PutStatus),
  Controller.putSupplyStatus,
);

router.put(
  '/:id',
  isAble('update', 'supply'),
  celebrate(Validator.Put),
  Controller.putSupply,
);
// router.delete('/:id', celebrate(Validator.Delete), Controller.deleteSupply);

router.post(
  '/:id/attend/:idSuppliedProduct',
  isAble('attend', 'supply'),
  celebrate(Validator.PostAttendSuppliedProduct),
  Controller.updateAttendSuppliedProduct,
);

module.exports = router;
