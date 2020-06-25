const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./productController');
const Validator = require('./productValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getProduct);
router.get('/', celebrate(Validator.List), Controller.listProducts);
router.post('/base', Controller.postProductBase); // TODO: Remove
router.post('/', celebrate(Validator.Post), Controller.postProduct);

module.exports = router;
