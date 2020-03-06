/**
* @author massi
*/

// var path = require("path");
// var webpack = require('webpack');
var BundleTracker = require('webpack-bundle-tracker');
var config = require('./webpack.config.base.js');
var path = require('path');
const port = process.env.PORT || 3000;

/* Use webpack dev server
config.entry = [
'webpack-dev-server/client?http://localhost:3000',
'webpack/hot/only-dev-server',
'./biosharing_web/assets/js/index'
]; */

config.devtool = 'source-map';

config.output.publicPath = `http://localhost:${port}/assets/bundles/`;
// override django's STATIC_URL for webpack bundles
// config.output.publicPath = 'http://localhost:3000/biosharing_web/static/bundles/';
config.output.sourceMapFilename = '[name]-[hash].js.map';

// Add HotModuleReplacementPlugin and BundleTracker plugins
config.plugins = config.plugins.concat([
    // new webpack.HotModuleReplacementPlugin(),
    // new webpack.NoErrorsPlugin(),
    new BundleTracker({path: __dirname, filename: 'webpack-stats-local.json'})
]);

// Add a loader for JSX files with react-hot enabled
config.module.loaders.push(
    {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, '..', 'app')
    }
);

//console.log(config);

module.exports = config;
