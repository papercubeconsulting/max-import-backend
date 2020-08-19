const { Joi } = require('celebrate');

const Get = {
  params: {
    id: Joi.number()
      .integer()
      .required(),
  },
};

const GetBankAccount = {
  params: {
    bankId: Joi.number()
      .integer()
      .required(),
    id: Joi.number()
      .integer()
      .required(),
  },
};

const List = {
  query: {},
};

const Post = {
  body: {
    name: Joi.string().required(),
    bankAccounts: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          account: Joi.string().required(),
          cci: Joi.string(),
        }),
      )
      .unique((a, b) => a.name === b.name || a.account === b.account)
      .required(),
  },
};

const PostBankAccount = {
  params: {
    bankId: Joi.number()
      .integer()
      .required(),
  },
  body: {
    name: Joi.string().required(),
    account: Joi.string().required(),
    cci: Joi.string(),
  },
};

module.exports = {
  Get,
  List,
  Post,
  GetBankAccount,
  PostBankAccount,
};
