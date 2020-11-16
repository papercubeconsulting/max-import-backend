const Service = require('./dispatch.service');

const listDispatch = async (req, res) => {
  const response = await Service.listDispatch(req.query);
  return res.status(response.status).send(response);
};

const getDispatch = async (req, res) => {
  const response = await Service.getDispatch(req.params);
  return res.status(response.status).send(response);
};

const postDispatchProductBox = async (req, res) => {
  const validate = await Service.validatePostDispatchProductBox(
    req.params,
    req.body,
  );

  if (validate.status !== 200)
    return res.status(validate.status).send(validate);

  const response = await Service.postDispatchProductBox(
    req.params,
    req.body,
    req.user,
    validate.data,
  );
  return res.status(response.status).send(response);
};

const postFinishDispatch = async (req, res) => {
  const response = await Service.postFinishDispatch(req.params, req.user);
  return res.status(response.status).send(response);
};

module.exports = {
  listDispatch,
  getDispatch,
  postDispatchProductBox,
  postFinishDispatch,
};
