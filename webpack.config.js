/*eslint-env node*/

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const config = {
  // tell webpack where the application starts
  //   in this case, index.js is the file that imports all the other files
  entry:  ['./src/index.js'],

  module: {
    rules: [
      // compile JS and JSX files with the babel loader
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },

      // compile CSS files with the style and CSS loaders
      // allows one to use relative paths (./ex1/ex2...) in CSS @import and url() statements
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },

      // compile image and font assets with the file loader
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|TTF)$/,
        use: [
          {
            loader: 'file-loader',
            options: {},
          },
        ],
      }
    ]
  },

  // tells webpack where to put built files
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index_bundle.js',
    publicPath: '/'
  },

  resolve: { extensions: ['*', '.js', '.jsx'] },

  devServer: {
    port: 8080,
    hotOnly: true,
    publicPath: '/',
    historyApiFallback: true,

    // opens a browser window at http://localhost:8080 upon running the dev server
    open: true
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),

    // uses copy-webpack-plugin to copy the favicon to the /dist directory
    // favicon isn't able to be bundled by any of the other loaders or plugins
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/favicon.ico", to: "favicon.ico" },
      ],
    }),

    // exposes NODE_ENV environment variable to clientside files
    //   used for selecting algolia/firebase configs
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],

  // sets the mode depending on environment variable
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development'
};

module.exports = config;