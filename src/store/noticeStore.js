/**
 * @file 公共提醒消息数据源
 * @author luwenlong
 */

import {observable, action, runInAction} from 'mobx'
import {StoreExt} from '@utils/reactExt'

class NoticeStore extends StoreExt {
    @observable msgnum: number = 0
    @observable opponews: number = 0
    @observable transnum: number = 0
    @observable corTips: array = []
    @observable recomProd: array = []
    @observable loading: string = ''

    @observable recomProd: array = []
    @observable recomProdMsg: string = ''

    @observable isShowCorTips: boolean = true

    @action
    notice = async (params): Promise<any> => {
        this.loading = 'start'

        try {
            let res = await this.api.globalNotice(params)
            let corTips = []

            if (Array.isArray(res[3]) && res[3].length) {
                corTips = [...corTips, ...res[3]]
            }

            if (Array.isArray(res[4]) && res[4].length) {
                res[4] = res[4].map(it => {
                    return {
                        id: it.id,
                        uid: it.uid,
                        kuid: it.kuid,
                        realName: it.content.uname || it.content.name,
                        conclusion: it.create_time + '，' + it.content.detail,
                        rel_uid: it.content.rel_uid,
                        type: it.content.insurance_type,
                        url: it.content.url,
                        isPush: 1
                    }
                })

                corTips = [...corTips, ...res[4]]
            }

            runInAction('notice', () => {
                this.loading = 'done'
                this.msgnum = +res[1] || 0
                this.opponews = +res[0].num || 0
                this.transnum = +res[2].total || 0
                this.corTips = corTips
            })
        }
        catch (err) {
            this.loading = 'done'
        }
    }

    @action
    formOk = (params): Object<any> => {
        let res = {}

        if (params.data) {
            res = {
                id: params.data.id,
                uid: params.data.uid,
                kuid: params.data.kuid,
                realName: params.data.nickname,
                conclusion: params.data.content
            }
        }
        else {
            res = {
                id: params.id,
                uid: params.uid,
                kuid: params.kuid,
                realName: params.content.uname || params.content.name,
                conclusion: params.create_time + '，' + params.content.detail,
                rel_uid: params.content.rel_uid,
                type: params.content.insurance_type,
                url: params.content.url,
                isPush: 1
            }
        }
        this.corTips = [...this.corTips, res]

        this.isShowCorTips = true
    }

    @action
    unRecomm = async (params): Promise<any> => {
        this.recomProdMsg = 'start'

        try {
            let res = await this.api.unRecomm(params)

            runInAction('unrecomm', () => {
                this.recomProdMsg = 'done'
                this.recomProd = res
            })
        }
        catch (err) {

        }
    }

    @action
    updateMsg = (params): Object<any> => {
        switch (params.type) {
            case 'clear':
                this[params.key] = 0
                break
            case 'incre':
                this[params.key] += 1
                break
            default:
                this[params.key] = params.value
                break
        }
    }

    @action
    readRecomm = async (params): Promise<any> => {
        try {
            let res = await this.api.readRecomm(params)

            runInAction('readRecomm', () => {
                this.unRecomm({kuid: window.kuid})
            })
        }
        catch (err) {

        }
    }

    @action
    commitRead = async (params): Promise<any> => {
        try {
            let res = await this.api.commitRead(params)
            runInAction('commitRead', () => {
                this.corTips = this.corTips.slice().filter(item => params.id != item.id)
            })
        }
        catch (err) {

        }
    }

    @action
    isShowNotice = (params): Object<any> => {
        this.isShowCorTips = params
    }
}

const noticeStore = new NoticeStore()

export default noticeStore
