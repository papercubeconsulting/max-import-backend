const { Bank, BankAccount } = require('@dbModels');
const { Op } = require('sequelize');

const { setResponse } = require('../../utils');

const getBank = async reqParams => {
  const bank = await Bank.findByPk(reqParams.id, { include: [BankAccount] });
  if (!bank) return setResponse(404, 'Bank not found.');
  return setResponse(200, 'Bank found.', bank);
};

const listBank = async reqQuery => {
  const deliveryAgencies = await Bank.findAll({
    where: reqQuery,
    include: [BankAccount],
  });
  return setResponse(200, 'Bank found.', deliveryAgencies);
};

const postBank = async reqBody => {
  let bank = await Bank.findOne({
    where: { name: reqBody.name },
  });
  if (bank) return setResponse(400, 'Bank already exists.');

  bank = await Bank.create(reqBody, { include: [BankAccount] });

  return setResponse(200, 'Bank created.', bank);
};

const getBankAccount = async reqParams => {
  const bankAccount = await BankAccount.findOne({
    where: reqParams,
    include: [Bank],
  });
  if (!bankAccount) return setResponse(404, 'BankAccount not found.');
  return setResponse(200, 'BankAccount found.', bankAccount);
};

const postBankAccount = async (reqParams, reqBody) => {
  const bank = await Bank.findByPk(reqParams.bankId);
  if (!bank) return setResponse(404, 'Bank not found.');

  const query = {
    [Op.or]: [
      { name: reqBody.name },
      { account: reqBody.account },
      { cci: reqBody.cci },
    ],
  };

  const bankAccounts = await bank.getBankAccounts({ where: query });
  if (bankAccounts.length)
    return setResponse(400, 'BankAccount already exists.');

  const bankAccount = await bank.createBankAccount(reqBody, {
    include: [Bank],
  });

  return setResponse(200, 'BankAccount created.', bankAccount);
};

module.exports = {
  getBank,
  listBank,
  postBank,
  getBankAccount,
  postBankAccount,
};
