const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpackRxjsExternals = require('webpack-rxjs-externals');

const config = {
    entry: './src/index.ts',
    externals: [
        webpackRxjsExternals(),
        // other externals here
    ],
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd'
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    optimization: {
        minimizer: [new UglifyJsPlugin({
            sourceMap: true
        })],
    },
    performance: {
        hints: false
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'development') {
        config.devtool = 'source-map';
    }

    return config;
};