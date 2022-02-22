const { merge } = require('webpack-merge')
const { resolve } = require('path')

const commonConfig = require('./common')

module.exports = merge(commonConfig, {
    devtool: 'source-map',
    entry: './index.tsx',
    mode: 'production',
    output: {
        filename: 'bundle.[contenthash].min.js',
        path: resolve(__dirname, '../../dist'),
        publicPath: '/plextus/'
    },
    plugins: []
})
