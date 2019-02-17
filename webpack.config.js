/*eslint-env node*/

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  entry: ['babel-polyfill', './src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },
  module: {
    rules: [
      { test: /\.(js)$/, exclude: /node_modules/, use: 'babel-loader' },
      { test: /\.css$/, use: [ 'style-loader', 'css-loader' ]},
      { test: /\.(png|jpe?g|gif|woff|woff2|eot|ttf|TTF|otf)$/, use: [
        {
          loader: 'file-loader'
        }
      ]}
    ]
  },
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/api': 'http://localhost:3000'
    },
    historyApiFallback: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    new CopyWebpackPlugin([
      {from:'src/resources', to: 'src/resources'},
      {from: 'favicon.ico', to: 'favicon.ico'}
    ]),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};

module.exports = config;