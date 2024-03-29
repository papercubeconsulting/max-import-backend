const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./product.controller');
const Validator = require('./product.validator');
const { isAble } = require('@/middleware/authorization');

const router = express.Router();

router.get(
  '/tradename',
  isAble('read', 'product'),
  celebrate(Validator.List),
  Controller.listTradename,
);

router.get(
  '/tradename-all',
  isAble('read', 'product'),
  Controller.listTradenameAll,
);

router.get(
  '/inventoryReport',
  isAble('read', 'product'),
  Controller.getInventoryReport,
);
router.get(
  '/:id',
  isAble('read', 'product'),
  celebrate(Validator.Get),
  Controller.getProduct,
);
router.get(
  '/',
  isAble('read', 'product'),
  celebrate(Validator.List),
  Controller.listProducts,
);

router.post('/base', Controller.postProductBase); // TODO: Remove
router.post(
  '/',
  isAble('create', 'product'),
  celebrate(Validator.Post),
  Controller.postProduct,
);

router.post('/csvUpload', Validator.validateCsv, Controller.uploadCsvData);

router.post(
  '/images/zipUpload',
  Validator.validateImagesZip,
  Controller.uploadImages,
);

router.put(
  '/:id',
  isAble('update', 'product'),
  celebrate(Validator.Put),
  Controller.putProduct,
);
router.delete(
  '/:id',
  isAble('delete', 'product'),
  celebrate(Validator.Delete),
  Controller.deleteProduct,
);
module.exports = router;
