module.exports = function(locals) {
  return locals.template({ html: '<h1>' + locals.path + '</h1>' });
};
