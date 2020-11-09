const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./client.controller');
const Validator = require('./client.validator');

const router = express.Router();

router.get('/:identifier', celebrate(Validator.Get), Controller.getClient);
router.get('/' /*, celebrate(Validator.Get)*/, Controller.listClient);
router.post('/', celebrate(Validator.Post), Controller.postClient);

module.exports = router;
