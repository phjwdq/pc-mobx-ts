const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const WebpackPwaManifest = require('webpack-pwa-manifest')

const {APP_ENV} = require('./constants')
const config = require('./config')
const {assetsPath} = require('./utils')
const env = require('./env.json')

const oriEnv = env[APP_ENV]

Object.assign(oriEnv, {APP_ENV})

// 将webpack下发变量置于process.env
const defineEnv = {}
for (let key in oriEnv) {
    defineEnv[`process.env.${key}`] = JSON.stringify(oriEnv[key])
}

const basePlugins = [
    new webpack.DefinePlugin(defineEnv),
]

// 注入模板中的变量
const injectVars = {
    title: config.title,
    feRoot: config.feRoot,
    pageRoot: config.pageRoot,
    apiPath: config.apiPath,
    socketPath: config.socketPath
}

const devPlugins = [
    new HtmlWebpackPlugin({
        ...injectVars,
        filename: 'index.html',
        template: 'build/tpl/index.html',
        inject: true
    })
]

const prodPlugins = [
    new webpack.WatchIgnorePlugin([/css\.d\.ts$/]),
    new WebpackPwaManifest({
        name: '灵智优诺-CRM系统',
        short_name: 'CRM',
        description: '内部CRM系统',
        background_color: '#fff',
        icons: [
            {
                src: path.resolve('src/assets/icon.png'),
                sizes: [96, 128, 192, 256, 384, 512]
            },
            //{
                //src: path.resolve('src/assets/large-icon.png'),
                //size: '1024x1024' // you can also use the specifications pattern
            //}
        ]
    }),
    new HtmlWebpackPlugin({
        ...injectVars,
        filename: config.index,
        template: 'build/tpl/index.html',
        inject: true,
        minify: {
            removeComments: true,
            collapseWhitespace: true,
            removeAttributeQuotes: true
        },
        chunksSortMode: 'dependency'
    }),
    new MiniCssExtractPlugin({
        filename: "[name].css",
        chunkFilename: "[name].[id].[chunkhash].css"
    }),
]

if (config.bundleAnalyzerReport) {
    const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
    prodPlugins.push(new BundleAnalyzerPlugin())
}

module.exports = basePlugins.concat(APP_ENV === 'dev' ? devPlugins : prodPlugins)
