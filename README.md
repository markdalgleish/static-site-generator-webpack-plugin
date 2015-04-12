[![Dependency Status](https://img.shields.io/david/markdalgleish/static-site-generator-webpack-plugin.svg?style=flat-square)](https://david-dm.org/markdalgleish/static-site-generator-webpack-plugin) [![npm](https://img.shields.io/npm/v/static-site-generator-webpack-plugin.svg?style=flat-square)](https://npmjs.org/package/static-site-generator-webpack-plugin) [![Gitter](https://img.shields.io/badge/gitter-join%20chat-45cba1.svg?style=flat-square)](https://gitter.im/markdalgleish/static-site-generator-webpack-plugin)

# static site generator webpack plugin

Minimal, unopinionated static site generator powered by webpack.

Provide a series of paths to be rendered, and a matching set of `index.html` files will be rendered in your output directory by executing your own custom, webpack-compiled render function.

This plugin works particularly well with isomorphic libraries like [React](https://github.com/facebook/react) and [React Router](https://github.com/rackt/react-router) since it allows you to prerender your routes at build time, rather than requiring a Node server in production.

## Install

```bash
$ npm install --save-dev static-site-generator-webpack-plugin
```

## Usage

### webpack.config.js

```js
var StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

module.exports = {

  entry: './render.js',

  output: {
    filename: 'render.js',
    path: 'dist',
    /* IMPORTANT!
     * You must compile a module that can
     * can be required in a Node context: */
    libraryTarget: 'umd'
  },

  plugins: [
    new StaticSiteGeneratorPlugin('render.js', ['/hello/', '/world/'], { locals... })
  ]

};
```

### render.js

```js
module.exports = function(locals, callback) {
  callback(null, '<html>...</html>');
};
```

### locals

```js
// The path currently being rendered
locals.path;

// An object containing all assets:
locals.assets;

// Any locals provided in your config are also available:
locals.hello === 'world';
```

## React Router example

```js
var React = require('react');
var Router = require('react-router');
var template = require('./template.ejs');

module.exports = function render(locals, callback) {

  Router.run(Routes, locals.path, function(Handler) {

    var html = template({
      html: React.renderToString(<Handler />),
      assets: locals.assets,
    });

    callback(null, html);

  });

};

```

## License

[MIT License](http://markdalgleish.mit-license.org)
