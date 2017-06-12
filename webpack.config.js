const path = require('path')
const webpack = require('webpack')
const CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

module.exports = {
  devtool: 'source-map',
  debug: true,

  entry: {
    'app': './src/app.main.renderer.ts'
  },

  output: {
    path: __dirname + '/build/',
    publicPath: 'build/',
    filename: '[name].js',
    sourceMapFilename: '[name].js.map',
    chunkFilename: '[id].chunk.js'
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.ts', '.js', '.json', '.css', '.html']
  },

  module: {
    loaders: [{
        test: /\.ts$/,
        loader: 'ts',
        exclude: [/node_modules/]
      },
      {
        test: /\.ts$/,
        loaders: ['ts', 'angular2-template-loader'],
        exclude: [/\.(spec|e2e)\.ts$/]
      },
      {
        test: /\.(html|css)$/,
        loader: 'raw-loader'
      }
    ]
  },

  plugins: [
    new CommonsChunkPlugin({
      name: 'angular2',
      filename: 'angular2.js',
      minChunks: Infinity
    }),
    new CommonsChunkPlugin({
      name: 'common',
      filename: 'common.js'
    })
  ]
}