module.exports = function(locals, callback) {
  callback(null, locals.template({ html: '<h1>' + locals.path + '</h1>' }));
};
