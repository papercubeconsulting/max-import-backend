const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./subfamily.controller');
const Validator = require('./subfamily.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getSubfamily);
router.get('/', celebrate(Validator.List), Controller.listSubfamilies);
router.post('/', celebrate(Validator.Post), Controller.postSubfamily);

module.exports = router;
