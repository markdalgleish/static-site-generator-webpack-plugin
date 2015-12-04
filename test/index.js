var webpack = require('webpack');
var fs = require('fs');
var clean = require('rimraf');
var glob = require('glob');
var assert = require('assert');
var directoryContains = require('./utils/directory-contains');

['basic', 'es-modules'].forEach(function(caseName) {

  describe(caseName, function () {

    beforeEach(function (done) {
      clean(__dirname + '/cases/' + caseName + '/actual-output', done);
    });

    it('generates a correct index.html file', function (done) {
      var webpackConfig = require('./cases/' + caseName + '/webpack.config.js');

      webpack(webpackConfig, function(err, stats) {
        if (err) {
          return done(err);
        }

        var caseDir = __dirname + '/cases/' + caseName;
        var expectedDir = caseDir + '/expected-output/';
        var actualDir = caseDir + '/actual-output/';

        directoryContains(expectedDir, actualDir, function(err, result) {
          if (err) {
            return done(err);
          }

          assert.equal(result, true);
          done();
        });
      });
    });

  });

});
