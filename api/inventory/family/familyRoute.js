const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./familyController');
const Validator = require('./familyValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getFamily);
router.get('/', celebrate(Validator.List), Controller.listFamilies);
router.post('/', celebrate(Validator.Post), Controller.postFamily);

module.exports = router;
