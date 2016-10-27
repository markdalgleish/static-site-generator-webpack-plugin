var RawSource = require('webpack-sources/lib/RawSource');
var evaluate = require('eval');
var path = require('path');
var Promise = require('bluebird');
var vm = require('vm');

function StaticSiteGeneratorWebpackPlugin(renderSrc, outputPaths, locals, scope) {
  this.renderSrc = renderSrc;
  this.outputPaths = Array.isArray(outputPaths) ? outputPaths : [outputPaths];
  this.locals = locals;
  this.scope = scope;
}

StaticSiteGeneratorWebpackPlugin.prototype.apply = function(compiler) {
  var self = this;

  compiler.plugin('this-compilation', function(compilation) {
    compilation.plugin('optimize-assets', function(_, done) {
      var renderPromises;

      var webpackStats = compilation.getStats();
      var webpackStatsJson = webpackStats.toJson();

      try {
        var asset = findAsset(self.renderSrc, compilation, webpackStatsJson);

        if (asset == null) {
          throw new Error('Source file not found: "' + self.renderSrc + '"');
        }

        var scope = loadChunkAssetsToScope(self.scope, compilation, webpackStatsJson);

        var assets = getAssetsFromCompilation(compilation, webpackStatsJson);

        var source = asset.source();
        var render = evaluate(source, /* filename: */ self.renderSrc, /* scope: */ scope, /* includeGlobals: */ true);

        if (render.hasOwnProperty('default')) {
          render = render['default'];
        }

        if (typeof render !== 'function') {
          throw new Error('Export from "' + self.renderSrc + '" must be a function that returns an HTML string');
        }

        renderPromises = self.outputPaths.map(function(outputPath) {
          var outputFileName = outputPath.replace(/^(\/|\\)/, ''); // Remove leading slashes for webpack-dev-server

          if (!/\.(html?)$/i.test(outputFileName)) {
            outputFileName = path.join(outputFileName, 'index.html');
          }

          var locals = {
            path: outputPath,
            assets: assets,
            webpackStats: webpackStats
          };

          for (var prop in self.locals) {
            if (self.locals.hasOwnProperty(prop)) {
              locals[prop] = self.locals[prop];
            }
          }

          var renderPromise = render.length < 2 ?
            Promise.resolve(render(locals)) :
            Promise.fromNode(render.bind(null, locals));

          return renderPromise
            .then(function(output) {
              compilation.assets[outputFileName] = new RawSource(output);
            })
            .catch(function(err) {
              compilation.errors.push(err.stack);
            });
        });

        Promise.all(renderPromises).nodeify(done);
      } catch (err) {
        compilation.errors.push(err.stack);
        done();
      }
    });
  });
};

function merge (a, b) {
  if (!a || !b) return a
  var keys = Object.keys(b)
  for (var k, i = 0, n = keys.length; i < n; i++) {
    k = keys[i]
    a[k] = b[k]
  }
  return a
}

var loadChunkAssetsToScope = function(scope, compilation, webpackStatsJson) {
  var manifest = findAsset('manifest', compilation, webpackStatsJson);
  var vendor = findAsset('vendor', compilation, webpackStatsJson);

  if (!manifest || !vendor) {
    return scope;
  }

  //var manifestRender = evaluate(manifest.source(), 'manifest', self.scope, true);
  if (!scope.window) {
    scope.window = {};
  }

  var sandbox = {};

  merge(sandbox, scope);
  var manifestScript = new vm.Script(manifest.source());
  var manifestRender = manifestScript.runInNewContext(sandbox, {});

  var vendorScript = new vm.Script(vendor.source());
  var vendorRender = vendorScript.runInNewContext(sandbox.window, {});

  return sandbox.window;
}

var findAsset = function(src, compilation, webpackStatsJson) {
  var asset = compilation.assets[src];

  if (asset) {
    return asset;
  }

  var chunkValue = webpackStatsJson.assetsByChunkName[src];

  if (!chunkValue) {
    return null;
  }
  // Webpack outputs an array for each chunk when using sourcemaps
  if (chunkValue instanceof Array) {
    // Is the main bundle always the first element?
    chunkValue = chunkValue[0];
  }
  return compilation.assets[chunkValue];
};

// Shamelessly stolen from html-webpack-plugin - Thanks @ampedandwired :)
var getAssetsFromCompilation = function(compilation, webpackStatsJson) {
  var assets = {};
  for (var chunk in webpackStatsJson.assetsByChunkName) {
    var chunkValue = webpackStatsJson.assetsByChunkName[chunk];

    // Webpack outputs an array for each chunk when using sourcemaps
    if (chunkValue instanceof Array) {
      // Is the main bundle always the first element?
      chunkValue = chunkValue[0];
    }

    if (compilation.options.output.publicPath) {
      chunkValue = compilation.options.output.publicPath + chunkValue;
    }
    assets[chunk] = chunkValue;
  }

  return assets;
};

module.exports = StaticSiteGeneratorWebpackPlugin;
