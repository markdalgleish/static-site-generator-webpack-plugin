var StaticSiteGeneratorPlugin = require('../../../');
var StatsWriterPlugin = require("webpack-stats-plugin").StatsWriterPlugin;
var webpack = require('webpack');
var ejs = require('ejs');
var fs = require('fs');

var template = ejs.compile(fs.readFileSync(__dirname + '/template.ejs', 'utf-8'))

var paths = [
  '/',
  '/foo',
  '/foo/bar'
];

module.exports = {
  entry: {
    index: __dirname + '/index.js',
    vendor: 'bluebird'
  },

  output: {
    filename: '[name].js',
    path: __dirname + '/actual-output',
    libraryTarget: 'umd'
  },

  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor', 'manifest'],
      minChunks: Infinity
    }),
    new StaticSiteGeneratorPlugin({
      entry: 'index',
      paths: paths,
      locals: {
        template: template
      }
    }),
    new StatsWriterPlugin() // Causes the asset's `size` method to be called
  ]
};
