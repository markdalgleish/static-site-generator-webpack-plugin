var glob = require('glob');

module.exports = function(cwd) {
  return glob.sync('*/', { cwd: cwd }).map(function(subDir) {
    return subDir.replace(/\/$/, '');
  });
};
