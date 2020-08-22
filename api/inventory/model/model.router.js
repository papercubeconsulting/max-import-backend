const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./model.controller');
const Validator = require('./model.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getModel);
router.get('/', celebrate(Validator.List), Controller.listModels);
router.post('/', celebrate(Validator.Post), Controller.postModel);

module.exports = router;