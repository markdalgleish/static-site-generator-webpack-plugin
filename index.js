var evaluate = require('eval');
var path = require('path');
var Promise = require('bluebird');

function StaticSiteGeneratorWebpackPlugin(renderSrc, outputPaths, locals, scope) {
  this.renderSrc = renderSrc;
  this.outputPaths = Array.isArray(outputPaths) ? outputPaths : [outputPaths];
  this.locals = locals;
  this.scope = scope;
}

StaticSiteGeneratorWebpackPlugin.prototype.apply = function(compiler) {
  var self = this;

  compiler.plugin('emit', function(compiler, done) {
    var renderPromises;

    var webpackStats = compiler.getStats();
    var webpackStatsJson = webpackStats.toJson();

    try {
      var asset = findAsset(self.renderSrc, compiler, webpackStatsJson);

      if (asset == null) {
        throw new Error('Source file not found: "' + self.renderSrc + '"');
      }

      var assets = getAssetsFromCompiler(compiler, webpackStatsJson);

      var source = asset.source();
      var render = evaluate(source, /* filename: */ self.renderSrc, /* scope: */ self.scope, /* includeGlobals: */ true);

      if (render.hasOwnProperty('__esModule')) {
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

        return Promise
          .fromNode(render.bind(null, locals))
          .then(function(output) {
            compiler.assets[outputFileName] = createAssetFromContents(output);
          })
          .catch(function(err) {
            compiler.errors.push(err.stack);
          });
      });

      Promise.all(renderPromises).nodeify(done);
    } catch (err) {
      compiler.errors.push(err.stack);
      done();
    }
  });
};

var findAsset = function(src, compiler, webpackStatsJson) {
  var asset = compiler.assets[src];

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
  return compiler.assets[chunkValue];
};

// Shamelessly stolen from html-webpack-plugin - Thanks @ampedandwired :)
var getAssetsFromCompiler = function(compiler, webpackStatsJson) {
  var assets = {};
  for (var chunk in webpackStatsJson.assetsByChunkName) {
    var chunkValue = webpackStatsJson.assetsByChunkName[chunk];

    // Webpack outputs an array for each chunk when using sourcemaps
    if (chunkValue instanceof Array) {
      // Is the main bundle always the first element?
      chunkValue = chunkValue[0];
    }

    if (compiler.options.output.publicPath) {
      chunkValue = compiler.options.output.publicPath + chunkValue;
    }
    assets[chunk] = chunkValue;
  }

  return assets;
};

var createAssetFromContents = function(contents) {
  return {
    source: function() {
      return contents;
    },
    size: function() {
      return contents.length;
    }
  };
};

module.exports = StaticSiteGeneratorWebpackPlugin;
