var glob = require('glob');
var async = require('async');
var fs = require('fs');
var path = require('path');

var readFile = function(path, done) {
  return fs.readFile(path, 'utf8', done);
};

module.exports = function(referenceDir, targetDir, done) {
  var compareFile = function(file, done) {
    var referenceFile = path.join(referenceDir, file);
    var targetFile = path.join(targetDir, file);

    async.map([referenceFile, targetFile], readFile, function(err, results) {
      if (err) {
        return done(err);
      }

      done(null, results[0] === results[1]);
    });
  };

  glob('**/*', { cwd: referenceDir, nodir: true }, function(err, files) {
    if (err) {
      return done(err);
    }

    async.map(files, compareFile, function(err, results) {
      if (err) {
        return done(err);
      }

      done(null, !results.some(function(result) { return !result; }));
    });
  });
};
