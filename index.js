var RawSource = require('webpack-sources/lib/RawSource');
var evaluate = require('eval');
var path = require('path');
var Promise = require('bluebird');

function StaticSiteGeneratorWebpackPlugin(options) {
  if (arguments.length > 1) {
    options = legacyArgsToOptions.apply(null, arguments);
  }

  this.entry = options.entry;
  this.paths = Array.isArray(options.paths) ? options.paths : [options.paths];
  this.locals = options.locals;
  this.globals = options.globals;
}

StaticSiteGeneratorWebpackPlugin.prototype.apply = function(compiler) {
  var self = this;

  compiler.plugin('this-compilation', function(compilation) {
    compilation.plugin('optimize-assets', function(_, done) {
      var renderPromises;

      var webpackStats = compilation.getStats();
      var webpackStatsJson = webpackStats.toJson();

      try {
        var asset = findAsset(self.entry, compilation, webpackStatsJson);

        if (asset == null) {
          throw new Error('Source file not found: "' + self.entry + '"');
        }

        var assets = getAssetsFromCompilation(compilation, webpackStatsJson);

        var source = asset.source();
        var render = evaluate(source, /* filename: */ self.entry, /* scope: */ self.globals, /* includeGlobals: */ true);

        if (render.hasOwnProperty('default')) {
          render = render['default'];
        }

        if (typeof render !== 'function') {
          throw new Error('Export from "' + self.entry + '" must be a function that returns an HTML string. Is output.libraryTarget in the configuration set to "umd"?');
        }

        renderPromises = self.paths.map(function(outputPath) {
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

function legacyArgsToOptions(entry, paths, locals, globals) {
  return {
    entry: entry,
    paths: paths,
    locals: locals,
    globals: globals
  };
}

module.exports = StaticSiteGeneratorWebpackPlugin;
