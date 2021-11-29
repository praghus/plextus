const { merge } = require('webpack-merge')
const webpack = require('webpack')
const commonConfig = require('./common')

module.exports = merge(commonConfig, {
    devServer: {
        hot: true
    },
    devtool: 'cheap-module-source-map',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './index.tsx'
    ],
    mode: 'development',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
