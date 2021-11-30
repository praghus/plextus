const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    context: resolve(__dirname, '../../src'),
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    },
    module: {
        rules: [
            {
                exclude: /node_modules/,
                test: [/\.jsx?$/, /\.tsx?$/],
                use: ['babel-loader']
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]',
                    'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
                ]
            }
        ]
    },
    performance: {
        hints: false
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
    ],
    resolve: {
        alias: {
            assert: require.resolve('assert/'),
            buffer: require.resolve('buffer/'),
            events: require.resolve('events/'),
            process: 'process/browser',
            'react-dom': '@hot-loader/react-dom',
            stream: require.resolve('stream-browserify'),
            timers: require.resolve('timers-browserify'),
            util: require.resolve('util/'),
            zlib: require.resolve('browserify-zlib')
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify')
        }
    }
}
