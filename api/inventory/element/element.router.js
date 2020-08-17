const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./element.controller');
const Validator = require('./element.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getElement);
router.get('/', celebrate(Validator.List), Controller.listElements);
router.post('/', celebrate(Validator.Post), Controller.postElement);

module.exports = router;
