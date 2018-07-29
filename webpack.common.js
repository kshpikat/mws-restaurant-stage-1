const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const responsiveLoaderSharp = require('responsive-loader/sharp');
const HtmlCriticalWebpackPlugin = require('html-critical-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');

const devMode = false;

module.exports = {
  // context: path.resolve(__dirname, "app"),
  mode: devMode ? 'development' : 'production',
  entry: {
    main: './app/js/main.js',
    restaurant: './app/js/restaurant.js'
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[chunkhash].js',
  },
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: devMode
        // include: /\.min\.js$/
      }),
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  devtool: devMode ? 'inline-source-map' : false,
  devServer: {
    contentBase: './dist',
    port: 8000,
    quiet: true,
    watchContentBase: true
  },
  plugins: [
    new WebpackMd5Hash(),
    new CleanWebpackPlugin('dist'),
    new UglifyJsPlugin({
      test: /\.js$/,
      cache: true,
      sourceMap: devMode,
      extractComments: !devMode
    }),
    new CopyWebpackPlugin([
      {
        from: './**/*.json',
        to: '.',
        flatten: true,
        context: './app/'
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: './img/icons/*',
        to: './img/icons',
        flatten: true,
        context: './app/'
      }
    ]),
    new CopyWebpackPlugin([
      {
        from: './_redirects',
        to: '.',
        flatten: true,
        context: './app/'
      }
    ]),
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: './app/index.html',
      minify: true,
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      filename: 'restaurant.html',
      template: './app/restaurant.html',
      minify: true,
      chunks: ['restaurant']
    }),
    new MiniCssExtractPlugin({
      filename: 'css/styles.css'
    }),
    new HtmlCriticalWebpackPlugin({
      base: 'dist',
      src: 'index.html',
      dest: 'index.html',
      inline: true,
      minify: true,
      extract: true,
      width: 1300,
      height: 900,
      penthouse: {
        blockJSRequests: false,
      }
    }),
    new HtmlCriticalWebpackPlugin({
      base: 'dist',
      src: 'restaurant.html',
      dest: 'restaurant.html',
      inline: true,
      minify: true,
      extract: true,
      width: 1300,
      height: 900,
      penthouse: {
        blockJSRequests: false,
      }
    }),
    new InjectManifest({
      swDest: 'sw.js',
      swSrc: './app/sw.src.js',
      exclude: [/\.png$/, /\.LICENSE$/, '_redirects']
    })
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }]
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()]
            }
          }
        ]
      },
      {
        test: /\.(jpg|png)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: responsiveLoaderSharp,
              sizes: [200, 500, 800],
              placeholder: true,
              placeholderSize: 100
            }
          }
        ]
      },
    ]
  }
};
