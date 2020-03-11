const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./supplyController');
const Validator = require('./supplyValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getSupply);
router.get('/', celebrate(Validator.List), Controller.listSupplies);
router.post('/', celebrate(Validator.Post), Controller.postSupply);
router.put(
  '/:id/status',
  celebrate(Validator.PutStatus),
  Controller.putSupplyStatus,
);
router.put('/:id', celebrate(Validator.Put), Controller.putSupply);
// router.delete('/:id', celebrate(Validator.Delete), Controller.deleteSupply);

router.post(
  '/:id/attend/:idSuppliedProduct',
  celebrate(Validator.PostAttendSuppliedProduct),
  Controller.updateAttendSuppliedProduct,
);

module.exports = router;
