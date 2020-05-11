const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = function (env) {
    var config = {
        entry: "./ts/index.tsx",
        output: {
            filename: "[name].bundle.js",
            chunkFilename: "[name].bundle.js",
            path: path.resolve(__dirname, "../server/static/js/"),
            publicPath: "/static/js/"
        },
        resolve: {
            // Add '.ts' and '.tsx' as a resolvable extension.
            extensions: [".ts", ".tsx", ".js", ".jsx"],
        },
        module: {
            loaders: [
                // all files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'
                {test: /\.tsx?$/, loader: "awesome-typescript-loader"},
                {test: /\.css$/, loader: "style-loader!css-loader"}
            ]
        },
        externals: {
            "jquery": "jQuery",
            "react": "React",
            "react-dom": "ReactDOM"
        }
    };

    if (env && env.production) {
        config.plugins = [
            new UglifyJSPlugin({sourceMap: true}),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new webpack.DefinePlugin({
                PRODUCTION: true,
                "process.env": {NODE_ENV: JSON.stringify("production")}
            })
        ];
    } else {
        config.plugins = [
            new webpack.DefinePlugin({PRODUCTION: false}),
            new BundleAnalyzerPlugin(),
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        ];
        //config.module.loaders.push({enforce: "pre", test: /\.js$/, loader: "source-map-loader"});
        //config.devtool = "source-map"
    }

    config.module.loaders.push({enforce: "pre", test: /\.js$/, loader: "source-map-loader"});
    config.devtool = "source-map";

    return config;
};