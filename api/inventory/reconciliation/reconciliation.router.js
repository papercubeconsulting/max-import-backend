const express = require('express');
const { celebrate } = require('celebrate');
const { isAble } = require('@/middleware/authorization');
const Controller = require('./reconciliation.controller');
const Validator = require('./reconciliation.validator');

const router = express.Router();
router.get('/preview', isAble('reconcile', 'inventory'), celebrate(Validator.Preview), Controller.preview);
router.post('/', isAble('reconcile', 'inventory'), celebrate(Validator.Confirm), Controller.confirm);
router.get('/:id', isAble('read', 'inventory'), celebrate(Validator.Read), Controller.read);
router.get('/', isAble('read', 'inventory'), celebrate(Validator.List), Controller.list);
module.exports = router;
