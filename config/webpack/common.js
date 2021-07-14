// shared config (dev and prod)
const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        fallback: {
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify')
        },
        alias: {
            'react-dom': '@hot-loader/react-dom',
            zlib: require.resolve('browserify-zlib'),
            buffer: require.resolve('buffer/'),
            events: require.resolve('events/'),
            process: 'process/browser',
            stream: require.resolve('stream-browserify'),
            assert: require.resolve('assert/'),
            timers: require.resolve('timers-browserify'),
            util: require.resolve('util/')
        }
    },
    context: resolve(__dirname, '../../src'),
    module: {
        rules: [
            {
                test: [/\.jsx?$/, /\.tsx?$/],
                use: ['babel-loader'],
                exclude: /node_modules/
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.(scss|sass)$/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(jpe?g|png|gif|svg|ico)$/i,
                use: [
                    'file-loader?hash=sha512&digest=hex&name=img/[contenthash].[ext]',
                    'image-webpack-loader?bypassOnDebug&optipng.optimizationLevel=7&gifsicle.interlaced=false'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({ template: 'index.html.ejs' }),
        new webpack.ProvidePlugin({
            process: 'process/browser'
        })
    ],
    externals: {
        react: 'React',
        'react-dom': 'ReactDOM'
    },
    performance: {
        hints: false
    }
}
