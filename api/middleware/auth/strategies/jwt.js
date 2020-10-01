/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const config = require('config');

const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');

const { readUser } = require('@/auth/user/user.service');

const userAttributes = ['id', 'role', 'name'];

const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('jwtSecret'),
    passReqToCallback: true,
    session: false,
  };

  const verifyCallback = async (req, jwtPayload, done) => {
    const user = await readUser(jwtPayload, {
      attributes: userAttributes,
    });

    if (user.status !== 200) {
      return done(null, false, user);
    }
    return done(null, user.data);
  };

  passport.use(new JWTStrategy(strategyOptions, verifyCallback));
};

module.exports = {
  strategy,
};
