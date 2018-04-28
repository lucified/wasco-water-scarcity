const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const postCssFlexbugsFixer = require('postcss-flexbugs-fixes');
const webpack = require('webpack');
const deployConfig = require('./deploy-config');

const browsers = ['> 0.5%', 'last 4 versions', 'Firefox ESR', 'not ie <= 10'];

const rules = [
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        options: {
          // cacheDirectory: true,
          presets: [
            [
              'env',
              {
                targets: {
                  browsers,
                },
              },
            ],
            'react',
          ],
          plugins: [
            // syntax-dynamic-import is needed for code-splitting:
            // https://reacttraining.com/react-router/web/guides/code-splitting
            'syntax-dynamic-import',
            // Reduces bundle size by not importing unused functions.
            'lodash',
            // Required for hot reloading. Should be disabled for production builds.
            'react-hot-loader/babel',
            // Outdated (?):
            // transform-regenerator is needed in order to transform generators.
            // Babelification can be removed once TypeScript supports generators,
            // probably in TS 2.3. When that is done, also change the output of
            // TS to 'es5' in tsconfig.json
            'transform-regenerator',
          ],
        },
      },
      { loader: require.resolve('ts-loader') },
    ],
  },
  {
    test: /\.(svg|jpeg|jpg|gif|png)$/,
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {
          name: '[name]-[hash:8].[ext]',
        },
      },
    ],
  },
  {
    test: /\.css$/,
    use: [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          importLoaders: 1,
          localIdentName: '[name]__[local]___[hash:base64:5]',
        },
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
          plugins: () => [
            postCssFlexbugsFixer,
            autoprefixer({
              browsers,
              flexbox: 'no-2009',
            }),
          ],
        },
      },
    ],
  },
  {
    test: /\.(woff|woff2|eot|ttf)$/,
    use: [
      {
        loader: require.resolve('file-loader'),
        options: {
          name: 'fonts/[name].[ext]',
        },
      },
    ],
  },
];

function getAppType() {
  switch (process.env.APP) {
    case 'future':
    case 'embed':
      return process.env.APP;
    default:
      // Default to 'past'
      return 'past';
  }
}

function getAppEntrypoint(appType) {
  switch (appType) {
    case 'future':
      return './src/future-entry.tsx';
    case 'embed':
      return './src/embed-entry.tsx';
    case 'past':
      return './src/past-entry.tsx';
  }
}

console.log(`Building the ${getAppType()} app`);

const config = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    strictExportPresence: true,
    rules,
  },
  output: {
    filename: 'index-[hash].js',
    chunkFilename: '[name].chunk.js',
    path: path.resolve(deployConfig.base.dest),
    publicPath: deployConfig.base.publicPath,
  },
  entry: [require.resolve('babel-polyfill'), getAppEntrypoint(getAppType())],
  plugins: [
    new HtmlWebpackPlugin({
      template: require.resolve(`${__dirname}/src/index-template.tsx`),
      inject: false,
      filename: 'index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
    }),
    new CopyWebpackPlugin([
      {
        from: 'public/*',
        flatten: true,
      },
    ]),
    new webpack.DefinePlugin({
      'process.env.ENV': JSON.stringify(deployConfig.env),
    }),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};

console.log('Building with deployConfig.env:', deployConfig.env);

if (['production', 'staging'].indexOf(deployConfig.env) > -1) {
  config.bail = true;
  config.mode = 'production';
  config.plugins = config.plugins.concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ]);
}

module.exports = config;
