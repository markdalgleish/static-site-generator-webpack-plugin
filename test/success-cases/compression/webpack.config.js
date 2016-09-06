var StaticSiteGeneratorPlugin = require('../../../');
var CompressionPlugin = require('compression-webpack-plugin');
var ejs = require('ejs');
var fs = require('fs');

var template = ejs.compile(fs.readFileSync(__dirname + '/template.ejs', 'utf-8'))

var paths = [
  '/'
];

module.exports = {
  entry: {
    main: __dirname + '/index.js'
  },

  output: {
    filename: 'index.js',
    path: __dirname + '/actual-output',
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin('index.js', paths, { template: template }),
    new CompressionPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.html$/,
      threshold: 0,
      minRatio: 999
    })
  ]
};
