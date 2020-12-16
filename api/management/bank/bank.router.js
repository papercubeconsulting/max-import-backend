const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./bank.controller');
const Validator = require('./bank.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/:id',
  isAble('read', 'bank'),
  celebrate(Validator.Get),
  Controller.getBank,
);

router.get(
  '/',
  isAble('read', 'bank'),
  celebrate(Validator.List),
  Controller.listBank,
);

router.post(
  '/',
  isAble('create', 'bank'),
  celebrate(Validator.Post),
  Controller.postBank,
);

router.get(
  '/:bankId/bankAccounts/:id',
  isAble('read', 'bank'),
  celebrate(Validator.GetBankAccount),
  Controller.getBankAccount,
);

router.post(
  '/:bankId/bankAccounts',
  isAble('create', 'bank'),
  celebrate(Validator.PostBankAccount),
  Controller.postBankAccount,
);

module.exports = router;
