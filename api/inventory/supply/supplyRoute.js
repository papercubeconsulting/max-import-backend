const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./supplyController');
const Validator = require('./supplyValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getSupply);
router.get('/', celebrate(Validator.List), Controller.listSupplies);
router.post('/', celebrate(Validator.Post), Controller.postSupply);
router.put('/:id', celebrate(Validator.Put), Controller.putSupply);
router.delete('/:id', celebrate(Validator.Delete), Controller.deleteSupply);

module.exports = router;
