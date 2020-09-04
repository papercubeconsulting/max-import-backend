/* eslint-disable global-require */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */

const setResponse = (status, message = '', data = null, userMessage = null) => {
  if (!userMessage) userMessage = message;
  return { data, status, message, userMessage };
};

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
};

const paginate = ({ page, pageSize }) => {
  const offset = page * pageSize - pageSize;
  const limit = pageSize;

  return {
    offset,
    limit,
  };
};

module.exports = {
  setResponse,
  asyncForEach,
  paginate,
  ...require('./email'),
};
