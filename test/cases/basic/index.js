module.exports = function(locals, callback) {
  setTimeout(function() {
    callback(null, locals.template({ html: '<h1>Basic Test</h1>' }));
  }, 10);
};
