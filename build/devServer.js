/**
 * @file devServer
 * @author luwenlong
 */
const WebpackDevServer = require('webpack-dev-server')
const webpack = require('webpack')
const config = require('./webpack.config')
const host = require('./getHost')

const compiler = webpack({
    ...config,
    mode: 'development'
})

const port = '8089'

const server = new WebpackDevServer(compiler, {
    open: false,
    compress: true,
    historyApiFallback: {
        index: 'tpl/index.html'
    },
    contentBase: "../",
    quiet: false,
    noInfo: false,
    hot: true,
    hotOnly: true,
    inline: true,
    lazy: false,
    progress: false,
    disableHostCheck: true,
    watchOptions: {
        aggregateTimeout: 300
    },
    host: host,
    port: port,
    proxy: {
        '/crm': {
            target: 'https://www.inno-life.cc',
            secure: false
        },
        '/im/imchat': {
            target: 'https://www.inno-life.cc',
            changeOrigin: false,
            secure: false,
        },
        '/api': {
            target: 'https://www.inno-life.cc',
            secure: false
        },
        '/partner': {
            target: 'http://123.57.81.151:8080',
            secure: false
        }
    }
})

server.listen(port, host, function() {
    console.log('server is running on http://%s:%s', host, port)
})
