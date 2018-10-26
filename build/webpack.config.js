const path = require('path')
const config = require('./config')
const {APP_ENV} = require('./constants')
const styleLoaders = require('./style-loaders')
const plugins = require('./plugins')
const {assetsPath, resolve} = require('./utils')
const optimization = require('./optimization')

module.exports = {
    mode: 'production',
    entry: {
        app: APP_ENV === 'dev'
            ? ['webpack-dev-server/client?http://0.0.0.0:8089', 'babel-polyfill', './src/index.tsx']
            : ['babel-polyfill', './src/index.tsx']
    },
    output: {
        path: config.assetsRoot,
        filename:
            APP_ENV === 'dev'
                ? '[name].js'
                : assetsPath('[name].[chunkhash].js'),
        chunkFilename:
            APP_ENV === 'dev'
                ? '[name].js'
                : assetsPath('[name].[id].[chunkhash].js'),
        publicPath: config.assetsPublicPath,
        globalObject: 'this'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
        modules: [resolve('src'), resolve('node_modules')],
        alias: {
            '@utils': resolve('src/utils'),
            '@assets': resolve('src/assets'),
            '@views': resolve('src/views'),
            '@components': resolve('src/components'),
            '@styles': resolve('src/styles')
        }
    },
    module: {
        rules: [
            ...styleLoaders,
            {
                test: /\.(ts(x?)|js(x?))$/,
                include: [resolve('src')],
                exclude: /node_modules/,
                use: [
                    'cache-loader',
                    'thread-loader',
                    {
                        loader: 'babel-loader',
                        options: {
                            cacheDirectory: true,
                            plugins: [
                                'react-hot-loader/babel'
                            ]
                        }
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            happyPackMode: true,
                            transpileOnly: true
                        }
                    }
                ]
            },
            {
                test: /\.generator\.js$/,
                include: [resolve('src')],
                exclude: /node_modules/,
                use: ['worker-loader']
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: assetsPath('img/[name].[hash:7].[ext]')
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: assetsPath('[name].[hash:7].[ext]')
                }
            }
        ]
    },
    plugins,
    optimization,
    devtool: config.sourceMap ? '#source-map' : false
 }




















