/**
 * @file HTTP
 * @author luwenlong
 */

import axios from 'axios'
import qs from 'qs'
import {Message, Notification} from 'antd'
import {AxiosRequestConfig, HttpResquest} from '../../types/interface'

enum HTTPERROR {
    LOGICERROR,
    TIMEOUTERROR,
    NETWORKERROR
}

const DEFAULTCONFIG = {
    baseURL: apiPath
}

const http: HttpResquest = {}
const methods = ['get', 'post', 'put', 'delete']

const isSuccess = res => {
    return typeof res === 'object'
        && (+res.code === 0 || +res.code === 200 || +res.status === 0)
}

const resFormat = res => res.response || res.data

methods.forEach(v => {
    http[v] = (url, data, apiPath?) => {
        const axiosConfig: AxiosRequestConfig = {
            method: v,
            url,
            baseURL: apiPath || DEFAULTCONFIG.baseURL
        }

        const instance = axios.create(DEFAULTCONFIG)

        // 拦截请求处理
        instance.interceptors.request.use(
            config => {
                const timestamp = Date.now() / 1000

                config.params = {
                    ...config.params,
                    timestamp
                }

                config.timeout = 150000

                return config
            },
            error => Promise.reject(error)
        )

        // 拦截响应处理
        instance.interceptors.response.use(
            response => {
                if (response.data.code === 402) {
                    Notification.error({
                        message: '登录已经过期'
                    })

                    setTimeout(
                        () => {
                            location.href = '/login'
                        },
                        300
                    )

                    return Promise.reject({
                        msg: '登录已过期'
                    })
                }

                if (response.data.code === 401) {
                    Notification.error({
                        message: '你没有权限访问'
                    })

                    return Promise.reject({
                        msg: '你没有权限访问'
                    })
                }

                let rdata = response.data

                if (!isSuccess(rdata)) {
                    const _err = {
                        msg: rdata.msg,
                        code: rdata.code,
                        type: HTTPERROR[HTTPERROR.LOGICERROR],
                        config: response.config
                    }

                    return Promise.reject(_err)
                }

                return resFormat(rdata)
            },
            error => {
                const _err = {
                    msg: error.message || '网络故障',
                    type: /^timeout of/.test(error.message)
                        ? HTTPERROR[HTTPERROR.TIMEOUTERROR]
                        : HTTPERROR[HTTPERROR.NETWORKERROR],
                    config: error.config
                }

                return Promise.reject(_err)
            }
        )

        if (v === 'get') {
            axiosConfig.params = data
        }
        else {
            axiosConfig.data = data
        }

        axiosConfig.startTime = new Date()

        // TODO 响应状况上报 有些错误不再前端提示 上报到服务器
        return instance
            .request(axiosConfig)
            .then(res => res)
            .catch(err => {
                /*err.msg && err.msg.indexOf('</') > 0*/
                    //? Message({
                        //showClose: true,
                        //duration: 0,
                        //message: err.msg
                    //})
                    //: Message.error(
                        //err.response || err.msg || err.stack || JSON.stringify(err)
                    /*)*/
                reporter({
                    name: err.name,
                    stack: err.stack,
                    message: err.message,
                })

                if (axiosConfig.url.includes('autoScript.set')) {
                    return Promise.resolve({err})
                }
                else {
                    return Promise.reject({
                        err,
                        stack: err.msg || err.stack || ''
                    })
                }
            }
        )
    }
})

export default http
