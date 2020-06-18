const { Joi } = require('celebrate');

const {
  emailValidator,
  passwordValidator,
  idNumberValidator,
} = require('../user/userValidator');

const Login = {
  body: Joi.object({
    ...emailValidator,
    ...passwordValidator,
  }),
};

module.exports = {
  Login,

  idNumberValidator,
  emailValidator,
  passwordValidator,
};
