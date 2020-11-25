const express = require('express');
const { celebrate } = require('celebrate');

const { authenticateMiddleware } = require('@/middleware/authentication');
const Validator = require('./authentication.validator');

const router = express.Router();

const userController = (status, message) => (req, res) => {
  return res.status(status).send({
    data: {
      user: req.user,
      token: req.user.generateAuthToken(),
    },
    status,
    message,
  });
};

router.post(
  '/login',
  celebrate(Validator.Login),
  authenticateMiddleware('localLogin'),
  userController(200, 'User found'),
);

module.exports = router;
