module.exports = function(locals, callback) {
  setTimeout(function() {
    callback(null, JSON.stringify(Object.keys(locals)));
  }, 10);
};
