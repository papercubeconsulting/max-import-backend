const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./warehouseController');
const Validator = require('./warehouseValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getWarehouse);
router.get('/', celebrate(Validator.List), Controller.listWarehouses);
router.post('/', celebrate(Validator.Post), Controller.postWarehouse);

module.exports = router;
