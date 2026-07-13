const express = require('express');
const { celebrate, Joi } = require('celebrate');
const { isAble } = require('@/middleware/authorization');
const Controller = require('./inventoryCode.controller');

const router = express.Router();
router.get('/:code', isAble('read', 'inventory'), celebrate({ params: { code: Joi.string().pattern(/^\d+$/).required() } }), Controller.resolve);
module.exports = router;
