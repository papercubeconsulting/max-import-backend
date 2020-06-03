/* eslint-disable no-param-reassign */
const passport = require('passport');
const strategies = require('./strategies');

const pipe = (...functions) => args =>
  functions.reduce((arg, fn) => fn(arg), args);

const initialiseAuthentication = app => {
  pipe(strategies.JWTStrategy)(app);
};

const authenticateMiddleware = (strategyName, options = {}) => (
  req,
  res,
  next,
) => {
  passport.authenticate(
    strategyName,
    { ...options, session: false },
    (err, user, info) => {
      if (err) return next(err);
      // TODO: Uncomment
      // if (!user) {
      //   if (!info.status)
      //     info = {
      //       status: 401,
      //       message: 'Authentication failed.',
      //     };
      //   return res.status(info.status).send(info);
      // }
      // req.user = user;
      req.user = {
        id: 1,
        name: 'Test',
      };
      return next();
    },
  )(req, res, next);
};

module.exports = {
  initialiseAuthentication,
  authenticateMiddleware,
};
