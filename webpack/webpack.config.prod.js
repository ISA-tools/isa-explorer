/**
 * @author massi
 */
var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var path = require('path');
var CompressionPlugin = require('compression-webpack-plugin');
var config = require('./webpack.config.base.js');

// config.output.path = require('path').resolve('./assets/dist')

config.output.path = path.resolve('asset', 'dist', 'prod');
config.output.filename = '[name].js';
config.output.publicPath = 'https://biosharing.org/static/dist/prod/';

config.plugins = config.plugins.concat([
    new BundleTracker({
        path: path.join('asset', 'dist'),
        filename: 'webpack-stats-prod.json'
    }),

  // removes a lot of debugging code in React
    new webpack.DefinePlugin({
        'process.env': {
            'NODE_ENV': JSON.stringify('production')
        }
    }),

    // keeps hashes consistent between compilations
    new webpack.optimize.OccurenceOrderPlugin(),

    // minifies your code
    new webpack.optimize.UglifyJsPlugin({
        compressor: {
            warnings: false
        }
    }),

    // compresses your code
    new CompressionPlugin({
        asset: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$\.html$/,
        threshold: 10240,
        minRatio: 0.8
    })

]);

// Add a loader for JSX files
config.module.loaders.push(
  { test: /\.jsx?$/, exclude: /(node_modules|bower_components)/, loader: 'babel' }
);

module.exports = config;
