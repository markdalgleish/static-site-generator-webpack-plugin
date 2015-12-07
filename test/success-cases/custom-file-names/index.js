module.exports = function(locals, callback) {
  setTimeout(function() {
    callback(null, locals.template({ html: '<h1>' + locals.path + '</h1>' }));
  }, 10);
};
