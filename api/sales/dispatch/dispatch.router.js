const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./dispatch.controller');
const Validator = require('./dispatch.validator');

const router = express.Router();

router.get('/', celebrate(Validator.List), Controller.listDispatch);
router.get('/:id', celebrate(Validator.Get), Controller.getDispatch);

module.exports = router;
