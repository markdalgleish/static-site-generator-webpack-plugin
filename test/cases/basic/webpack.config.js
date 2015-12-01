var StaticSiteGeneratorPlugin = require('../../../');
var ejs = require('ejs');
var fs = require('fs');

var template = ejs.compile(fs.readFileSync(__dirname + '/template.ejs', 'utf-8'))

module.exports = {
  entry: {
    main: __dirname + '/index.js'
  },

  output: {
    filename: 'index.js',
    path: __dirname + '/actual-output',
    publicPath: '/',
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin('main', ['/'], { template: template })
  ]
};
