const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./client.controller');
const Validator = require('./client.validator');

const router = express.Router();

router.put('/:id', celebrate(Validator.Update), Controller.updateClient);
router.get('/:identifier', celebrate(Validator.Get), Controller.getClient);
router.get('/', celebrate(Validator.List), Controller.listClient);
router.post('/', celebrate(Validator.Post), Controller.postClient);

module.exports = router;
