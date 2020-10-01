const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./product.controller');
const Validator = require('./product.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getProduct);
router.get('/', celebrate(Validator.List), Controller.listProducts);
router.post('/base', Controller.postProductBase); // TODO: Remove
router.post('/', celebrate(Validator.Post), Controller.postProduct);
router.put('/:id', celebrate(Validator.Put), Controller.putProduct);

module.exports = router;
