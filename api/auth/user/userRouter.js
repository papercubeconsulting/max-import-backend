const express = require('express');
const { celebrate } = require('celebrate');

const Controller = require('./userController');
const Validator = require('./userValidator');

const router = express.Router();
const secureRouter = express.Router();
const unSecureRouter = express.Router();

const { authenticateMiddleware } = require('../../middleware/auth');

unSecureRouter.post(
  '/forgotpassword',
  celebrate(Validator.ForgotPassword),
  Controller.forgotPassword,
);

unSecureRouter.post(
  '/resetpassword',
  celebrate(Validator.ResetPassword),
  Controller.resetPassword,
);

router.get('/me', Controller.getUserMe);
router.get('/:id', celebrate(Validator.Get), Controller.readUser);
router.get('/', celebrate(Validator.List), Controller.listUsers);
router.post('/', celebrate(Validator.Post), Controller.createUser);

secureRouter.use('/', unSecureRouter);
secureRouter.use('/', authenticateMiddleware('jwt'), router);

module.exports = secureRouter;
