const { merge } = require('webpack-merge')
const webpack = require('webpack')
const commonConfig = require('./common')

module.exports = merge(commonConfig, {
    mode: 'development',
    entry: [
        'react-hot-loader/patch',
        'webpack-dev-server/client?http://localhost:8080',
        'webpack/hot/only-dev-server',
        './index.tsx'
    ],
    devServer: {
        hot: true
    },
    devtool: 'cheap-module-source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
