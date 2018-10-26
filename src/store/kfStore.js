/**
 * @file 客服账号数据源
 * @author luwenlong
 */

import {observable, action, runInAction} from 'mobx'
import {StoreExt} from '@utils/reactExt'

class KfStore extends StoreExt {
    @observable loading: boolean = false
    @observable busy: number = Number(window.localStorage.getItem('busy')) || 0

    @observable allkf: array = []
    @observable fetchkf: string = ''

    @observable assigning: string = ''

    @action
    login = async (params): Promise<any> => {
        this.loading = true

        try {
            const res = await this.api.login(params)

            window.localStorage.setItem('kuid', res.kuid)
            window.localStorage.setItem('kuname', res.username)
            window.localStorage.setItem('role', res.role)
            window.localStorage.setItem('busy', res.busy)

            this.$message.success(res.msg || '登录成功')

            window.location.href = '/im'
        }
        catch (err) {}

        runInAction('hideLoading', () => {
            this.loading = false
        })
    }

    @action
    changeBusy = async (params): Promise<any> => {
        try {
            let res = await this.api.changeBusy(params)

            window.localStorage.setItem('busy', +res.busy)

            runInAction('changeBusy', () => {
                this.busy = +res.busy
            })
        }
        catch (err) {

        }
    }

    @action
    logout = async (params): Promise<any> => {
        try {
            let res = await this.api.logout(params)

            const exp = new Date('2010-01-01').toGMTString()

            window.localStorage.removeItem('busy')
            window.localStorage.removeItem('kuid')
            window.localStorage.removeItem('kuname')
            window.localStorage.removeItem('role')

            window.location.reload()
        }
        catch (err) {

        }
    }

    @action
    getallkf = async (params): Promise<any> => {
        this.fetchkf = 'start'
        this.assigning = ''

        try {
            let res = await this.api.allkf(params)

            runInAction('allkf', () => {
                if (!res || !Array.isArray(res.kflist)) {
                    this.fetchkf = 'fail'
                }
                else {
                    this.allkf = res.kflist
                    this.fetchkf = 'done'
                }
            })
        }
        catch (err) {
            this.fetchkf = 'fail'
        }
    }

    @action
    assign = async (params): Promise<any> => {
        this.assigning = 'start'

        try {
            const {kuid, tokuid, content, user} = params
            const res = await this.api.assign({
                kuid: kuid,
                uid: user.uid || user ,
                tokuid: tokuid,
                content: content
            })

            runInAction('assign', () => {
                this.assigning = 'done'

                window.msgManager.assign({
                    kuid: kuid,
                    tokuid: tokuid,
                    content: content,
                    user: user
                })
            })
        }
        catch (err) {
            this.assigning = 'fail'
        }
    }
}

const kfStore = new KfStore()

export default kfStore
