/**
 * @file 统一接口请求
 * @author luwenlong
 */

import axios from 'axios'
import http from './http'
import API from './apis'

const apiNames = Object.keys(API).filter(it => {
    return !['opporNews', 'weiMsgNum', 'transGlobal', 'corTips', 'comList', 'getBase'].includes(it)
})

const apis = {
    globalNotice: function (data): Promise<any> {
        return axios.all([
            http.post(API.opporNews, data || {}),
            http.post(API.weiMsgNum, data || {}),
            http.post(API.transGlobal, data || {}),
            http.post(API.corTips, data || {}),
            http.post(API.comList, data || {})
        ])
    },
    getBase: function (data): Promise<any> {
        return http.get(API.getBase, data || {}, window.pageRoot)
    }
}

apiNames.forEach(it => {
    apis[it] = function (data): Promise<any> {
        if (/partner/.test(API[it])) {
            return http.post(API[it], data || {}, window.pageRoot)
        }

        return http.post(API[it], data || {})
    }
})

export default apis
