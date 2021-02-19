const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./user.controller');
const Validator = require('./user.validator');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('@/middleware/authentication');
const { isAble } = require('@/middleware/authorization');

secureRouter.post(
  '/forgotpassword',
  celebrate(Validator.ForgotPassword),
  Controller.forgotPassword,
);

secureRouter.post(
  '/resetpassword',
  celebrate(Validator.ResetPassword),
  Controller.resetPassword,
);

router.post(
  '/updatepassword',
  celebrate(Validator.UpdatePassword),
  Controller.updatePassword,
);

router.get('/me', Controller.getUserMe);
router.get(
  '/:id',
  isAble('read', 'user'),
  celebrate(Validator.Get),
  Controller.readUser,
);
router.get(
  '/',
  isAble('read', 'user'),
  celebrate(Validator.List),
  Controller.listUsers,
);
router.post(
  '/',
  isAble('create', 'user'),
  celebrate(Validator.Post),
  Controller.createUser,
);
router.put(
  '/:id',
  isAble('udpdate', 'user'),
  celebrate(Validator.Put),
  Controller.updateUser,
);

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
