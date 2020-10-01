const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./family.controller');
const Validator = require('./family.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getFamily);
router.get('/', celebrate(Validator.List), Controller.listFamilies);
router.post('/', celebrate(Validator.Post), Controller.postFamily);

module.exports = router;
