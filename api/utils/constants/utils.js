const _ = require('lodash');

const HOSTNAME_DESA = 'appdesa.maximportaciones.com.pe';
const HOSTNAME_PROD = 'app.maximportaciones.com.pe';

module.exports = {
  getHostName: () =>
    process.NODE_ENV === 'production' ? HOSTNAME_PROD : HOSTNAME_DESA,
  getDictValues: dict => {
    return Object.keys(dict).map(function(key) {
      return _.get(dict[key], 'value', dict[key]);
    });
  },
};
