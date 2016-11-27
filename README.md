[![Build Status](https://img.shields.io/travis/markdalgleish/static-site-generator-webpack-plugin/master.svg?style=flat-square)](http://travis-ci.org/markdalgleish/static-site-generator-webpack-plugin) [![Coverage Status](https://img.shields.io/coveralls/markdalgleish/static-site-generator-webpack-plugin/master.svg?style=flat-square)](https://coveralls.io/r/markdalgleish/static-site-generator-webpack-plugin) [![Dependency Status](https://img.shields.io/david/markdalgleish/static-site-generator-webpack-plugin.svg?style=flat-square)](https://david-dm.org/markdalgleish/static-site-generator-webpack-plugin) [![npm](https://img.shields.io/npm/v/static-site-generator-webpack-plugin.svg?style=flat-square)](https://npmjs.org/package/static-site-generator-webpack-plugin)

# static site generator webpack plugin

Minimal, unopinionated static site generator powered by webpack.

Provide a series of paths to be rendered, and a matching set of `index.html` files will be rendered in your output directory by executing your own custom, webpack-compiled render function.

This plugin works particularly well with universal libraries like [React](https://github.com/facebook/react) and [React Router](https://github.com/rackt/react-router) since it allows you to prerender your routes at build time, rather than requiring a Node server in production.

## Install

```bash
$ npm install --save-dev static-site-generator-webpack-plugin
```

## Usage

Ensure you have webpack installed, e.g. `npm install -g webpack`

### webpack.config.js

```js
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');

const paths = [
  '/hello/',
  '/world/'
];

module.exports = {

  entry: {
    'main': './index.js'
  },

  output: {
    filename: 'index.js',
    path: 'dist',
    /* IMPORTANT!
     * You must compile to UMD or CommonJS
     * so it can be required in a Node context: */
    libraryTarget: 'umd'
  },

  plugins: [
    // `main` is the bundle name sepcified in the `entry` section above.
    new StaticSiteGeneratorPlugin('main', paths, {
      // Properties here are merged into `locals`
      // passed to the exported render function
      greet: 'Hello'
    })
  ]

};
```

### index.js

#### Sync rendering

```js
module.exports = function render(locals) {
  return '<html>' + locals.greet + ' from ' + locals.path + '</html>';
};
```

#### Async rendering (callbacks)

```js
module.exports = function render(locals, callback) {
  callback(null, '<html>' + locals.greet + ' from ' + locals.path + '</html>');
};
```

#### Async rendering (promises)

```js
module.exports = function render(locals) {
  return Promise.resolve('<html>' + locals.greet + ' from ' + locals.path + '</html>');
};
```

### Default locals

```js
// The path currently being rendered:
locals.path;

// An object containing all assets:
locals.assets;

// Advanced: Webpack's stats object:
locals.webpackStats;
```

Any additional locals provided in your config are also available.

## Custom file names

By providing paths that end in `.html`, you can generate custom file names other than the default `index.html`. Please note that this may break compatibility with your router, if you're using one.

```js
module.exports = {

  ...

  plugins: [
    new StaticSiteGeneratorPlugin('main', [
      '/index.html',
      '/news.html',
      '/about.html'
    ], locals)
  ]
};
```

## Scope

If required, you can provide an object that will exist in the global scope when executing your render function. This is particularly useful if certain libraries or tooling you're using assumes a browser environment.

For example, when using Webpack's `require.ensure`, which assumes that `window` exists:

```js
const scope = { window: {} };

module.exports = {
  ...,
  plugins: [
    new StaticSiteGeneratorPlugin('main', paths, locals, scope)
  ]
}
```

## Asset support

template.ejs
```ejs
<% css.forEach(function(file){ %>
<link href="<%- file %>" rel="stylesheet">
<% }); %>

<% js.forEach(function(file){ %>
<script src="<%- file %>" async></script>
<% }); %>
```

index.js
```js
if (typeof global.document !== 'undefined') {
  const rootEl = global.document.getElementById('outlay');
  React.render(
    <App />,
    rootEl,
  );
}

export default (data) => {
  const assets = Object.keys(data.webpackStats.compilation.assets);
  const css = assets.filter(value => value.match(/\.css$/));
  const js = assets.filter(value => value.match(/\.js$/));
  return template({ css, js, ...data});
}
```

## Compression support

Generated files can be compressed with [compression-webpack-plugin](https://github.com/webpack/compression-webpack-plugin), but first ensure that this plugin appears before compression-webpack-plugin in your plugins array:

```js
const StaticSiteGeneratorPlugin = require('static-site-generator-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

module.exports = {
  ...

  plugins: [
    new StaticSiteGeneratorPlugin(...),
    new CompressionPlugin(...)
  ]
};
```

## React Router example

The following example uses [React Router v1.0.0-rc1](https://github.com/rackt/react-router/tree/v1.0.0-rc1) with [history](https://github.com/rackt/history).

```js
import React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMServer from 'react-dom/server';
import { createHistory, createMemoryHistory } from 'history';
import { Router, RoutingContext, match } from 'react-router';

import routes from './routes';
import template from './template.ejs';

// Client render (optional):
if (typeof document !== 'undefined') {
  const history = createHistory();
  const outlet = document.getElementById('outlet');

  ReactDOM.render(<Router history={history} routes={routes} />, outlet);
}

// Exported static site renderer:
export default (locals, callback) => {
  const history = createMemoryHistory();
  const location = history.createLocation(locals.path);

  match({ routes, location }, (error, redirectLocation, renderProps) => {
    callback(null, template({
      html: ReactDOMServer.renderToString(<RoutingContext {...renderProps} />),
      assets: locals.assets
    }));
  });
};

```

## Related projects

- [react-router-to-array](https://github.com/alansouzati/react-router-to-array) - useful for avoiding hardcoded lists of routes to render
- [gatsby](https://github.com/gatsbyjs/gatsby) - opinionated static site generator built on top of this plugin

## License

[MIT License](http://markdalgleish.mit-license.org)
