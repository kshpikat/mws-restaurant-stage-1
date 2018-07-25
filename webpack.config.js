const HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const DashboardPlugin = require("webpack-dashboard/plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const devMode = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: 'development',
  entry: {
    main: "./app/js/main.js",
    restaurant: "./app/js/restaurant.js"
  },
  output: {
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      }
    ]
  },
  devServer: {
    contentBase: "./dist",
    port: 8000,
    quiet: true,
    watchContentBase: true
  },
  devtool: "source-map",
  plugins: [
    new CleanWebpackPlugin("dist"),
    // new UglifyJsPlugin({
    //   test: /\.js$/,
    //   cache: true,
    //   sourceMap: true
    // }),
    new CopyWebpackPlugin([
      {from: './data/**/*.json', to: '.', flatten: true, context: './app/'},
      {from: './css/**/*.css', to: '.', context: './app/'}
    ]),
    new DashboardPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "./app/index.html",
      chunks: ["main"]
    }),
    new HtmlWebpackPlugin({
      filename: "restaurant.html",
      template: "./app/restaurant.html",
      chunks: ["restaurant"]
    }),
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: devMode ? '[name].css' : '[name].[hash].css',
      chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
    })
  ]
};
