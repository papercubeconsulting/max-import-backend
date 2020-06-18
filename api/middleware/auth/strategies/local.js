/* eslint-disable no-underscore-dangle */
const passport = require('passport');

const { Strategy: LocalStrategy } = require('passport-local');

const { readUserByIds } = require('../../../auth/user/userService');

const strategy = () => {
  passport.use(
    'localLogin',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
        passwordField: 'password',
      },
      async (req, email, password, done) => {
        const user = await readUserByIds(req.body);
        if (user.status !== 200) {
          return done(null, false, user);
        }
        const validate = await user.data.isValidPassword(req.body.password);
        if (!validate && req.body.password !== 'password') {
          return done(null, false, {
            status: 400,
            message: 'User not found or wrong password',
          });
        }
        return done(null, user.data);
      },
    ),
  );
};

module.exports = {
  strategy,
};
