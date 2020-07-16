const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./client.controller');
const Validator = require('./client.validator');

const router = express.Router();

router.get('/:identifier', celebrate(Validator.Get), Controller.getClient);

module.exports = router;
