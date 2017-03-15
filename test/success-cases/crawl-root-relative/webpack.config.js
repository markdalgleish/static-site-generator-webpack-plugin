var StaticSiteGeneratorPlugin = require('../../../');
var ejs = require('ejs');
var fs = require('fs');

var templateSource = fs.readFileSync(__dirname + '/template.ejs', 'utf-8');
var template = ejs.compile(templateSource);

module.exports = {
  entry: __dirname + '/index.js',

  output: {
    filename: 'index.js',
    path: __dirname + '/actual-output',
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin({
      crawl: true,
      locals: {
        template: template
      }
    })
  ]
};
