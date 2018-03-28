const autoprefixer = require('autoprefixer');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const postCssFlexbugsFixer = require('postcss-flexbugs-fixes');
const webpack = require('webpack');
const deployConfig = require('./deploy-config');

const name = '[name]-[hash:8].[ext]';

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
          // Needed in order to transform generators. Babelification can be removed
          // once TypeScript supports generators, probably in TS 2.3.
          // When that is done, also change the output of TS to 'es5' in tsconfig.json
          plugins: ['react-hot-loader/babel', 'transform-regenerator'],
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
          name,
        },
      },
    ],
  },
  {
    test: /\.scss$/,
    use: [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: true,
          importLoaders: 2,
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
      require.resolve('sass-loader'),
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
    path: path.resolve(deployConfig.base.dest),
    publicPath: deployConfig.base.publicPath,
  },
  entry: [require.resolve('babel-polyfill'), './src/index.tsx'],
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
    // This skips adding all locales to moment. NOTE: If more locales then 'en'
    // are needed, another approach will need to be used.
    // https://github.com/moment/moment/issues/2373#issuecomment-279785426
    // See also:
    // https://github.com/webpack/webpack/issues/3128
    // https://github.com/moment/moment/issues/2517
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
