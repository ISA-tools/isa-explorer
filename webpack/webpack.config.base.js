/**
 * @author massi
 */
const path = require('path');
const webpack = require('webpack');
const BundleTracker = require('webpack-bundle-tracker');

module.exports = {

    context: path.resolve(__dirname, '..'),

    // entry point of our app. assets/js/index.js should require other js modules and dependencies it needs
    entry: {
        app: path.resolve('app', 'js', 'index')
    },

    output: {
        path: path.resolve('assets', 'bundles'),
        filename: '[name]-[hash].js'
    },

    plugins: [
        new webpack.ProvidePlugin({
            'Promise': 'imports?this=>global!exports?global.Promise!es6-promise',
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        })
    ],

    module: {
        loaders: [
            {
                test: /\.scss$/,
                loader: 'style!css!sass?outputStyle=expanded'
            },
            {
                test: /\.css$/,
                loader: 'style!css!'
            },
            {
                test: /\.json$/, loader: 'json'
            },
            {
                test: /\.woff(2)?(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream'
            },
            {
                test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file'
            },
            {
                test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml'
            }
        ]
    },

    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    }

};
