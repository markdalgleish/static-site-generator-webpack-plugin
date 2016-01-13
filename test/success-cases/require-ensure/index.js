// Do not actually call this function, because executing require.ensure requires a 'document'.
function dontDoIt() {
  require.ensure([], function() {
    var foo = require('./foo');  
  });    
}

module.exports = function(locals, callback) {
  setTimeout(function() {
    callback(null, locals.template({ html: '<h1>' + locals.path + '</h1>' }));
  }, 10);

};
