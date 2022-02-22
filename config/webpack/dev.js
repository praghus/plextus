const { merge } = require('webpack-merge')
const { resolve } = require('path')
const webpack = require('webpack')
const commonConfig = require('./common')

module.exports = merge(commonConfig, {
    devServer: {
        hot: true,
        static: './dist'
    },
    devtool: 'cheap-module-source-map',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './index.tsx'
    ],
    mode: 'development',
    output: {
        filename: 'bundle.[contenthash].min.js',
        path: resolve(__dirname, '../../dist')
    },
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
