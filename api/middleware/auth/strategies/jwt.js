/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const config = require('config');

const { Strategy: JWTStrategy, ExtractJwt } = require('passport-jwt');

const strategy = () => {
  const strategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.get('jwtSecret'),
    passReqToCallback: true,
    session: false,
  };

  const verifyCallback = async (req, jwtPayload, done) => {
    // const user = await readUser({ id: jwtPayload._id }); // TODO: Actualizar segun sea necesario

    const user = {
      status: 200,
      message: 'User found',
      data: {
        id: 1,
        name: 'Test',
      },
    };

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
