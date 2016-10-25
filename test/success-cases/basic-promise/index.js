var Promise = require('bluebird');

module.exports = function(locals) {
  return Promise.resolve(locals.template({ html: '<h1>' + locals.path + '</h1>' }));
};
