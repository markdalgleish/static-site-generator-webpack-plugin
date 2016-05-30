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
  // Get all chunks
  var chunks = webpackStatsJson.chunks;

  var assets = {
    // Will contain all js & css files by chunk
    chunks: {},
    // Will contain all js files
    js    : {},
    // Will contain all css files
    css   : {}
  };

  for (var i = 0; i < chunks.length; i++) {
    var chunk = chunks[i];
    var chunkName = chunk.names[0];

    assets.chunks[chunkName] = {};

    // Prepend the public path to all chunk files
    var chunkFiles = [].concat(chunk.files).map(function(chunkFile) {
      return compiler.options.output.publicPath + chunkFile;
    });

    // Append a hash for cache busting
    if (compiler.options.hash) {
      chunkFiles = chunkFiles.map(function(chunkFile) {
        return self.appendHash(chunkFile, webpackStatsJson.hash);
      });
    }

    // Webpack outputs an array for each chunk when using sourcemaps
    // But we need only the entry file
    var entry = chunkFiles[0];
    assets.chunks[chunkName].size = chunk.size;
    assets.chunks[chunkName].entry = entry;
    assets.chunks[chunkName].hash = chunk.hash;
    assets.js[chunkName] = entry;

    // Gather all css files
    var css = chunkFiles.filter(function(chunkFile) {
      // Some chunks may contain content hash in their names, for ex. 'main.css?1e7cac4e4d8b52fd5ccd2541146ef03f'.
      // We must proper handle such cases, so we use regexp testing here
      return /.css($|\?)/.test(chunkFile);
    });
    assets.chunks[chunkName].css = css;
    if ('string' === typeof css[0]) {
      assets.css[chunkName] = css[0];
    }
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
