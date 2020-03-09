const { setResponse } = require('../../../utils');
const { status } = require('../../../utils/constants');

const { Supply } = require('../supplyModel');

const updateSupplyStatus = async (reqBody, reqParams) => {
  const supply = await Supply.update(
    { status: reqBody.status },
    {
      where: { id: reqParams.id, status: status.PENDING },
    },
  );

  if (!supply[0])
    return setResponse(
      404,
      `Supply not found or current status different from ${status.PENDING}.`,
    );

  return setResponse(200, 'Supply status updated.');
};

module.exports = updateSupplyStatus;
