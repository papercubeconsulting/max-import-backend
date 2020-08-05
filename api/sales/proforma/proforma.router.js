const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./proforma.controller');
const Validator = require('./proforma.validator');

const router = express.Router();

router.post('/', celebrate(Validator.Post), Controller.postProforma);
router.get('/:id', celebrate(Validator.Get), Controller.getProforma);
router.get('/', celebrate(Validator.List), Controller.listProforma);

module.exports = router;
