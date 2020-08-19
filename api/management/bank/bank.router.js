const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./bank.controller');
const Validator = require('./bank.validator');

const router = express.Router();

router.get('/:id', celebrate(Validator.Get), Controller.getBank);
router.get('/', celebrate(Validator.List), Controller.listBank);
router.post('/', celebrate(Validator.Post), Controller.postBank);

router.get(
  '/:bankId/bankAccounts/:id',
  celebrate(Validator.GetBankAccount),
  Controller.getBankAccount,
);
router.post(
  '/:bankId/bankAccounts',
  celebrate(Validator.PostBankAccount),
  Controller.postBankAccount,
);

module.exports = router;
