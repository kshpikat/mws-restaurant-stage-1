const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackMd5Hash = require('webpack-md5-hash');
const autoprefixer = require('autoprefixer');
const responsiveLoaderSharp = require('responsive-loader/sharp');

module.exports = {
  // context: path.resolve(__dirname, "app"),
  entry: {
    main: './app/js/main.js',
    restaurant: './app/js/restaurant.js'
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[chunkhash].js',
  },
  plugins: [
    new WebpackMd5Hash(),
    new CleanWebpackPlugin('dist'),

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
      filename: 'css/[name].[chunkhash].css'
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
        test: /\.s?css$/,
        use: [
          'style-loader', // creates style nodes from JS strings
          MiniCssExtractPlugin.loader,
          'css-loader', // translates CSS into CommonJS
          {
            loader: 'sass-loader', // compiles Sass to CSS, using Node Sass by default
            options: {
              includePaths: ['./node_modules']
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer()]
            }
          }
        ]
      },
      // {
      //   test: /\.css$/,
      //   use: [
      //     'style-loader',
      //     MiniCssExtractPlugin.loader,
      //     'css-loader',
      //     {
      //       loader: 'postcss-loader',
      //       options: {
      //         plugins: () => [autoprefixer()]
      //       }
      //     }
      //   ]
      // },
      {
        test: /\.(jpg|png)$/,
        use: [
          {
            loader: 'responsive-loader',
            options: {
              adapter: responsiveLoaderSharp,
              sizes: [200, 500, 800],
              placeholder: true,
              placeholderSize: 40
            }
          }
        ]
      },
    ]
  }
};
