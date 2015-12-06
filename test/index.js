var webpack = require('webpack');
var fs = require('fs');
var clean = require('rimraf');
var glob = require('glob');
var assert = require('assert');
var directoryContains = require('./utils/directory-contains');

['basic', 'custom-file-names', 'es-modules'].forEach(function(caseName) {

  describe(caseName, function () {

    beforeEach(function (done) {
      clean(__dirname + '/cases/' + caseName + '/actual-output', done);
    });

    it('generates the expected HTML files', function (done) {
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
