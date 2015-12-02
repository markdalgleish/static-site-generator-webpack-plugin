var webpack = require('webpack');
var fs = require('fs');
var clean = require('rimraf');
var assert = require('assert');

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

        var expected = fs.readFileSync(__dirname + '/cases/' + caseName + '/expected-output/index.html', 'utf-8');
        var actual = fs.readFileSync(__dirname + '/cases/' + caseName + '/actual-output/index.html', 'utf-8');
        assert.equal(actual, expected);

        done();
      });
    });

  });

});
