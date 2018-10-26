/**
 * @file CRM
 * @author luwenlong
 */

import React from 'react'
import {render} from 'react-dom'
import {Provider} from 'mobx-react'
import {configure} from 'mobx'
import AppRouter from './router'
import axios from 'axios'
import {LocaleProvider} from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import Emitter from '@utils/Emitter'
import './styles/reset.less'

window.kuid = window.localStorage.getItem('kuid')
window.kuname = window.localStorage.getItem('kuname')
window.role = window.localStorage.getItem('role')

import store from './store'

configure({enforceActions: 'observed'})

// configure({enforceActions: false})


import MsgManager from '@utils/MsgManager'

window.msgManager = null

window.$emitter = new Emitter()

if (kuid && kuname) {
    window.msgManager = new MsgManager(store)
}

// 错误上报
window.addEventListener('error', function (errMsg, scriptURI, lineNumber, columnNumber, errObj) {
    let message = "错误信息：" + errMsg
        + "\n 出错文件：" + scriptURI
        + "\n 出错行号：" + lineNumber
        + "\n 出错列号：" + columnNumber
        + "\n 错误详情：" + errObj

    reporter({message})

    return true
})

window.addEventListener('unhandledrejection', function (err) {
    err.preventDefault()

    reporter({message: err.reason || JSON.stringify(err)})

    return true
})

window.reporter = function (params) {
    axios.post(
        apiPath + '/im/api/evamonitor',
        {
            project: 'crm',
            version: '2.0',
            platform: 'pc',
            ua: window.navigator.userAgent,
            network: window.navigator.connection,
            url: window.location.href,
            kuid: window.kuid,
            kuname: window.kuname,
            ...params
        }
    )
}

// xss攻击过滤
function replacexss(str) {
    return str.replace(/(<|>|img|url|3c|3e|696d67|75726c|\/?script|img|\/?iframe|alert|onclick|onfocus)/ig, '');
}

window.replacexss = replacexss

render(
    <Provider {...store}>
        <LocaleProvider locale={zh_CN} {...store}><AppRouter /></LocaleProvider>
    </Provider>,
    document.getElementById('app') as HTMLElement
)


