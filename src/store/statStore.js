/**
 * @file 统计数据源
 * @author luwenlong
 */

import {observable, action, runInAction} from 'mobx'
import {Spin, StoreExt} from '@utils/reactExt'

class StatStore extends StoreExt {
    @observable stat: object = {}
    @observable loading: string = ''

    @observable khpagin: object = {}
    @observable khlist: array = []
    @observable khlistMsg: string = ''

    @observable kflist: array = []
    @observable kfpagin: object = {}
    @observable kflistMsg: string = ''

    @observable graph: object = {}
    @observable graphMsg: string = ''

    // 统计数据
    @action
    dataStat = async (params): Promise<any> => {
        this.loading = 'start'

        try {
            let res = await this.api.dataStat(params)

            runInAction('stat', () => {
                this.stat = res
                this.loading = 'done'
            })
        }
        catch (err) {
            console.log('获取统计数据出错: ', err)
            this.loading = 'done'
        }
    }

    // 客户检索
    @action
    userSearch = async (params): Promise<any> => {
        this.khlistMsg = 'start'

        let khlist = []
        let khpagin = {}

        try {
            let res = await this.api.userSearch(params)

            khlist = res.list

            khpagin = {
                defaultCurrent: +res.pageset.page,
                total: +res.pageset.pagetotal
            }
        }
        catch (err) {
            console.log('客户搜索出错: ', err)
        }

        runInAction('usearch', () => {
            this.khlistMsg = 'done'
            this.khlist = khlist
            this.khpagin = khpagin
        })
    }

    // 客服检索
    @action
    custSearch = async (params): Promise<any> => {
        this.kflistMsg = 'start'

        let kflist = []
        let kfpagin = {}

        try {
            let res = await this.api.custSearch(params)

            kflist = res.list

            kfpagin = {
                defaultCurrent: +res.pageset.page,
                total: +res.pageset.pagetotal
            }
        }
        catch (err) {
            console.log('客服搜索出错: ', err)
        }

        runInAction('csearch', () => {
            this.kflistMsg = 'done'
            this.kflist = kflist
            this.kfpagin = kfpagin
        })
    }

    // 沟通图表
    @action
    homeGraph = async (params): Promise<any> => {
        this.graphMsg = 'start'

        let graph = {}

        try {
            graph = await this.api.homeGraph(params)
        }
        catch (err) {
            console.log('获取沟通数据出错: ', err)
        }

        runInAction('csearch', () => {
            this.graphMsg = 'done'
            this.graph = graph
        })
    }
}

const statStore = new StatStore()

export default statStore
