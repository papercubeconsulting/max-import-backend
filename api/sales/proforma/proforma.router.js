const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./proforma.controller');
const Validator = require('./proforma.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.post(
  '/',
  isAble('create', 'proforma'),
  celebrate(Validator.Post),
  Controller.postProforma,
);
router.get(
  '/:id',
  isAble('read', 'proforma'),
  celebrate(Validator.Get),
  Controller.getProforma,
);
router.get(
  '/',
  isAble('read', 'proforma'),
  celebrate(Validator.List),
  Controller.listProforma,
);
router.put(
  '/:id',
  isAble('update', 'proforma'),
  celebrate(Validator.Put),
  Controller.putProforma,
);

router.post('/:id/pdf', Controller.sendPdfProforma);
router.post('/:id/downloadpdf', Controller.downloadProforma);

router.get(
  '/validate_discount/:transactionId',
  Controller.getInfoValidationStatus,
);

router.post(
  '/validate_discount/:transactionId',
  Controller.validateDiscountProforma,
);

module.exports = router;
