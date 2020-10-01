const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./deliveryAgency.controller');
const Validator = require('./deliveryAgency.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getDeliveryAgency);
router.get('/', celebrate(Validator.List), Controller.listDeliveryAgency);
router.post('/', celebrate(Validator.Post), Controller.postDeliveryAgency);

module.exports = router;
