const express = require('express');
const { celebrate } = require('celebrate');
const { isAble } = require('@/middleware/authorization');
const Controller = require('./unitTicketPrint.controller');
const Validator = require('./unitTicketPrint.validator');

const router = express.Router();
router.post('/', isAble('print', 'inventory'), celebrate(Validator.Create), Controller.create);
router.get('/:id', isAble('read', 'inventory'), celebrate(Validator.Read), Controller.read);
router.get('/', isAble('read', 'inventory'), celebrate(Validator.List), Controller.list);
module.exports = router;
