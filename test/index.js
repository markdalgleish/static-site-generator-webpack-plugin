var webpack = require('webpack');
var fs = require('fs');
var clean = require('rimraf');
var assert = require('assert');

describe('Basic usage', function () {

  beforeEach(function (done) {
    clean(__dirname + '/cases/basic/actual-output', done);
  });

  it('generates an index.html file', function (done) {
    var webpackConfig = require('./cases/basic/webpack.config.js');

    webpack(webpackConfig, function(err, stats) {
      if (err) {
        return done(err);
      }

      var expected = fs.readFileSync(__dirname + '/cases/basic/expected-output/index.html', 'utf-8');
      var actual = fs.readFileSync(__dirname + '/cases/basic/actual-output/index.html', 'utf-8');
      assert.equal(actual, expected);

      done();
    });
  });

});
