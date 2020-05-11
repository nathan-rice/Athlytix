const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = function (env) {
    var config = {
        entry: "./ts/index.ts",
        output: {
            filename: "../server/static/js/bookmarklet.js"
        },
        devtool: "source-map",
        resolve: {
            // Add '.ts' and '.tsx' as a resolvable extension.
            extensions: [".ts", ".tsx", ".js", ".jsx"]
        },
        module: {
            loaders: [
                // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
                {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
                {enforce: "pre", test: /\.js$/, loader: "source-map-loader"},
                {test: /\.css$/, loader: "style-loader!css-loader"}
            ]
        }
        // Can't use external jQuery because some sites have a positively ancient version.
        //externals: {"jquery": "jQuery"}
    };

    if (env && env.production) {
        config.plugins = [
            new UglifyJSPlugin(),
            new webpack.DefinePlugin({
                PRODUCTION: true,
                SERVER: "'www.athlytix.org'",
                "process.env": {NODE_ENV: JSON.stringify("production")}
            })
        ]
    } else {
        config.plugins = [new webpack.DefinePlugin({
            PRODUCTION: false,
            SERVER: "'localhost:5000'"
        })];
        config.module.loaders.push({enforce: "pre", test: /\.js$/, loader: "source-map-loader"});
        config.devtool = "source-map"
    }

    return config;
};