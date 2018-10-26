/**
 * @file socket
 * @author luwenlong
 */

import io from 'socket.io-client'

// TODO socket日志上报
export default class MsgManager {
    constructor(store) {
        let socket = io(socketPath)

        this.socket = socket

        socket.emit('add user', {
            kuid: kuid,
            kuname: kuname
        })

        socket.on('disconnect', () => {
        })

        socket.on('reconnect', data => {
            socket.emit('add user', {
                kuid: kuid,
                kuname: kuname
            })
        })

        // 更新客户消息
        socket.on('global custmsg warning', data => {
            try {
                if (+kuid === +data.kuid && +store.custStore.currUser.uid !== data.uid) {
                    store.noticeStore.updateMsg({
                        type: 'incre',
                        key: 'msgnum'
                    })
                }
            }
            catch (err) {

            }
        })

        // 更新转接客户
        socket.on('transcusttip enter', data => {
            try {
                if (data.tokuid == kuid) {
                    store.noticeStore.updateMsg({
                        type: 'incre',
                        key: 'transnum'
                    })

                    // 更新到用户列表中
                    data.user.active = 0
                    store.custStore.insertNewMsg(data.user)
                }
            }
            catch (err) {
                console.error('转接客户消息报错: ', err);
            }
        })

        // 更新商机
        socket.on('busienter', data => {
            try {
                if (data.cuid == kuid) {
                    store.noticeStore.updateMsg({
                        type: 'incre',
                        key: 'transnum'
                    })
                }
            }
            catch (e) {

            }
        })

        // 打开推荐书消息提醒
        socket.on('recommendation', data => {
            store.noticeStore.unRecomm({kuid})
        })

        // 收到用户消息
        socket.on('custmsgenter', async data => {
            // 更新到用户列表中
            store.custStore.insertNewMsg(data)

            // 更新到聊天记录中
            if (+store.custStore.currUser.uid === +data.uid) {
                store.custStore.insertWeiHis(data)
            }
        })

        socket.on('service reply', data => {
            store.custStore.serviceReply(data)
        })

        // 提醒消息
        socket.on('msgtipsenter', function (data) {
            try {
                store.noticeStore.formOk(data)
            }
            catch (e) {
                console.log('添加提醒消息出错: ', e)
            }
        })

        // 提醒消息
        socket.on('uploadmessage', function (data) {
            try {
                store.noticeStore.formOk(data)
            }
            catch (e) {
                console.log('添加提醒消息出错: ', e)
            }
        })

    }

    typing(msg) {
        this.socket.emit('typing', msg)
    }

    assign(data) {
        this.socket.emit('transcust', data)
    }
}
