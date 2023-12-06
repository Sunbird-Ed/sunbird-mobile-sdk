const path = require('path');

const webpackRxjsExternals = function rxjsExternalsFactory() {
    return function rxjsExternals(context, request, callback) {
        if (request.match(/^rxjs(\/|$)/)) {
            var parts = request.split('/');
            if (parts.length > 2) {
                console.warn('webpack-rxjs-externals no longer supports v5-style deep imports like rxjs/operator/map etc. It only supports rxjs v6 pipeable imports via rxjs/operators or from the root.');
            }

            return callback(null, {
                root: parts,
                commonjs: request,
                commonjs2: request,
                amd: request
            });
        }

        callback();
    };
};

const clientServicesExternals = function clientServicesExternalsFactory() {
    return function rxjsExternals(context, request, callback) {
        if (request.match(/^@project-sunbird\/client-services(\/|$)/)) {
            var parts = request.split('/');
            if (parts.length > 2) {
                console.warn('webpack-rxjs-externals no longer supports v5-style deep imports like rxjs/operator/map etc. It only supports rxjs v6 pipeable imports via rxjs/operators or from the root.');
            }

            return callback(null, {
                root: parts,
                commonjs: request,
                commonjs2: request,
                amd: request
            });
        }

        callback();
    };
};

const config = {
    entry: './src/index.ts',
    externals: [
        webpackRxjsExternals(),
        clientServicesExternals()
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
        extensions: ['.tsx', '.ts', '.js'],
        fallback: { 
            "crypto": false,
            "stream": false,
            "buffer": false,
            "util": false
        }
    },
    optimization: {
        minimize: true
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
