const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const productionConfig = require('./webpack.config.js');

const browsers = ['> 0.5%', 'last 4 versions', 'Firefox ESR', 'not ie <= 10'];

const devConfig = {
  mode: 'development',

  // For server path
  output: {
    publicPath: '/',
    path: '/',
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
  },

  // For dev server
  devServer: {
    publicPath: '/',
    // Enable hot reloading server. It will provide /sockjs-node/ endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the Webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    hot: true,
    // Enable gzip compression of generated files.
    compress: true,
    // For react-router's browserHistory
    historyApiFallback: {
      // Needed for handling react-router params that contain dots, i.e. raw deployment redirects:
      // https://github.com/ReactTraining/react-router/issues/3409#issuecomment-272023984
      disableDotRule: true,
    },
  },

  devtool: 'cheap-module-eval-source-map',

  plugins: [
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebookincubator/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
  ],
};

module.exports = merge.smartStrategy({
  entry: 'replace',
})(productionConfig, devConfig);
