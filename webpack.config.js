//@ts-check

'use strict';

const path = require('path');
const webpack = require("webpack");

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

const webConfig = /** @type WebpackConfig */ {
    context: __dirname,
    mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')
    target: "webworker", // web extensions run in a webworker context
    entry: {
        extension: "./src/extension.ts" // source of the web extension main file
    },
    output: {
        filename: "extension.js",
        path: path.join(__dirname, "./dist/web"),
        libraryTarget: "commonjs",
    },
    resolve: {
        mainFields: ["browser", "module", "main"], // look for `browser` entry point in imported node modules
        extensions: [".ts", ".js"], // support ts-files and js-files
        alias: {
            '@env': path.join(__dirname, './src/env/web')
        },
        fallback:
        {
            "path": require.resolve("path-browserify"),
            "child_process": false,
            "assert": false,
            "stream": false,
            "http": false,
            "https": false,
            "crypto": false,
            "util": false,
            "fs/promises": false,
            "os": false,
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader",
                    },
                ],
            },
            {
                test: /\.node$/,
                loader: "native-ext-loader"
            }
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser", // provide a shim for the global `process` variable
        }),
        new webpack.NormalModuleReplacementPlugin(/node:/, (resource) => {
            resource.request = resource.request.replace(/^node:/, "");
        })
    ],
    externals: {
        vscode: "commonjs vscode" // ignored because it doesn't exist
    },
    performance: {
        hints: false,
    },
    devtool: "nosources-source-map", // create a source map that points to the original source file
};

/** @type WebpackConfig */
const nodeConfig = {
    context: __dirname,
    target: 'node', // VS Code extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
    mode: 'none', // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

    entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
    output: {
        // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
        path: path.join(__dirname, "./dist/node"),
        filename: 'extension.js',
        libraryTarget: 'commonjs2'
    },
    externals: {
        vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
        // modules added here also need to be added in the .vscodeignore file
    },
    resolve: {
        // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
        extensions: ['.ts', '.js'],
        alias: {
            '@env': path.join(__dirname, './src/env/node')
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader'
                    }
                ]
            },
            {
                test: /\.node$/,
                loader: "native-ext-loader"
            }
        ]
    },
    devtool: 'nosources-source-map',
    infrastructureLogging: {
        level: "log", // enables logging required for problem matchers
    },
};
module.exports = [nodeConfig, webConfig];