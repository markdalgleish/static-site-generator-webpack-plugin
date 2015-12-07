var webpack = require('webpack');
var fs = require('fs');
var clean = require('rimraf');
var glob = require('glob');
var expect = require('chai').expect;
var directoryContains = require('./utils/directory-contains');

describe('Success cases', function() {

  ['basic', 'custom-file-names', 'es-modules'].forEach(function(successCase) {

    describe(successCase, function () {

      beforeEach(function (done) {
        clean(__dirname + '/success-cases/' + successCase + '/actual-output', done);
      });

      it('generates the expected HTML files', function (done) {
        var webpackConfig = require('./success-cases/' + successCase + '/webpack.config.js');

        webpack(webpackConfig, function(err, stats) {
          if (err) {
            return done(err);
          }

          var caseDir = __dirname + '/success-cases/' + successCase;
          var expectedDir = caseDir + '/expected-output/';
          var actualDir = caseDir + '/actual-output/';

          directoryContains(expectedDir, actualDir, function(err, result) {
            if (err) {
              return done(err);
            }

            expect(result).to.be.ok;
            done();
          });
        });
      });

    });

  });

});

describe('Error cases', function() {

  ['missing-source'].forEach(function(errorCase) {

    describe(errorCase, function () {

      beforeEach(function (done) {
        clean(__dirname + '/error-cases/' + errorCase + '/actual-output', done);
      });

      it('generates the expected error', function (done) {
        var webpackConfig = require('./error-cases/' + errorCase + '/webpack.config.js');
        var expectedError = require('./error-cases/' + errorCase + '/expected-error.js');

        webpack(webpackConfig, function(err, stats) {
          var actualError = stats.compilation.errors[0].toString().split('\n')[0];
          expect(actualError).to.include(expectedError);
          done();
        });
      });

    });

  });

});
