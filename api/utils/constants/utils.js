const _ = require('lodash');

module.exports = {
  getDictValues: dict => {
    return Object.keys(dict).map(function(key) {
      return _.get(dict[key], 'value', dict[key]);
    });
  },
};
