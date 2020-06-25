const { strategy: JWTStrategy } = require('./jwt');
const { strategy: LocalStrategy } = require('./local');

module.exports = {
  JWTStrategy,
  LocalStrategy,
};
