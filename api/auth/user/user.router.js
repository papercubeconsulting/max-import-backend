const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./user.controller');
const Validator = require('./user.validator');

const router = express.Router();
const secureRouter = express.Router();

const { authenticateMiddleware } = require('@/middleware/authentication');

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

router.get('/me', Controller.getUserMe);
router.get('/:id', celebrate(Validator.Get), Controller.readUser);
router.get('/', celebrate(Validator.List), Controller.listUsers);
router.post('/', celebrate(Validator.Post), Controller.createUser);
router.put('/:id', celebrate(Validator.Put), Controller.updateUser);

secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
