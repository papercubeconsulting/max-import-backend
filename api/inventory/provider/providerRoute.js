const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./providerController');
const Validator = require('./providerValidator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getProvider);
router.get('/', celebrate(Validator.List), Controller.listProviders);
router.post('/', celebrate(Validator.Post), Controller.postProvider);

module.exports = router;
