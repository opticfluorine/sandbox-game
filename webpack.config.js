const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const LicensePlugin = require('webpack-license-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = (env) => { 
    // Environment configuration.
    const isDev = (env.build === 'dev');

    // Basic setup valid for dev or prod builds.
    let exports = {
        entry: './src/index.ts',
        devtool: 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader'],
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 
                isDev ? 'dist-devel' : 'dist'),
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: 'body',
                showErrors: false,
            }),
            new ESLintPlugin({
                extensions: ['ts'],
                fix: true,
            }),
            new LicensePlugin({
                unacceptableLicenseTest: (licenseId) => {
                    return ['GPL', 'AGPL', 'LGPL', 'NGPL'].includes(licenseId);
                },
            }),
            isDev && new webpack.HotModuleReplacementPlugin(),
        ].filter(Boolean),
        performance: {
            hints: false,
            maxEntrypointSize: 512000,
            maxAssetSize: 512000,
        },
        mode: isDev ? 'development' : 'production',
    };

    // Build specialization.
    if (isDev) {
        // Enable dev server with hot reloading.
        exports.devServer = {
            static: './dist-devel',
            hot: true,
        };
    }

    return exports;
};
