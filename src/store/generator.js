/**
 * @file 生成用户列表
 * @author luwenlong
 */

import {uniqBy, findIndex} from 'lodash'
import {repeat, sort, handleUserProp} from '@utils/utils'

/* eslint-disable */
onmessage = function (msg) {
    let currUser = {}

    try {
        console.time('generator')
        let {data, params} = msg.data

        // 去除重复uid数据
        data = uniqBy(data, 'uid')

        // 过滤同一时刻数据
        const hash = {}
        for (let i = 0, len = data.length; i < len; i++) {
            if (hash[data[i].ctime]) {
                hash[data[i].ctime].push(data[i])
            }
            else {
                hash[data[i].ctime] = [data[i]]
            }
        }

        // 添加时间戳
        for (let prop in hash) {
            if (hash.hasOwnProperty(prop)) {
                if (hash[prop].length > 1) {
                    hash[prop].forEach((it, index) => {
                        it.ctime += '.' + repeat(index)
                    })
                }
            }
        }

        // 整合userList
        let userList = []
        for (let key in hash) {
            userList.push(...hash[key])
        }

        // 处理补充数据属性
        userList = userList.map((item, index) => {
            item = handleUserProp(item)

            // 当前有查询用户 且uid在userlist中
            let hasUid = userList.some(item => +item.uid === +params.uid)
            if (params.uid && hasUid && +item.uid === +params.uid) {
                currUser = item
                item.active = 1
            }

            return item
        })

        const nore = userList.filter(it => it.highlight)
            .sort((a, b) => +a.cdiff - +b.cdiff)
        //sort(nore, (a, b) => +a.cdiff - +b.cdiff)

        const isre = userList.filter(it => !it.highlight)
            //.sort((a, b) => +a.cdiff - +b.cdiff)
        sort(isre, (a, b) => +a.cdiff - +b.cdiff)

        userList = [...nore, ...isre]

        // 没有查询用户 || 查询用户不存在
        if (!Object.keys(currUser).length) {
            userList[0].active = 1
            currUser = userList[0]
        }

        console.timeEnd('generator')
        postMessage({userList, currUser})
    }
    catch (err) {
        postMessage({
            userList: [],
            currUser: {}
        })
    }
}
