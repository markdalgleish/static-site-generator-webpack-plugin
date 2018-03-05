var StaticSiteGeneratorPlugin = require('../../../');
var ejs = require('ejs');
var fs = require('fs');

var paths = ['/', '/foo', '/foo/bar'];

module.exports = {
  entry: {
    bar: __dirname + '/bar.js',
    main: __dirname + '/index.js'
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/actual-output',
    publicPath: '/foo/',
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin({
      entry: 'main',
      locals: ({ path, webpackStats }) => ({
        chunks: Object.keys(webpackStats.compilation.assets).map(
          file => `${webpackStats.compilation.outputOptions.publicPath}${file}`
        )
      })
    })
  ]
};
