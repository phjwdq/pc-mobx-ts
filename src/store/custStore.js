/**
 * @file 用户数据源
 * @author luwenlong
 */

import {observable, action, runInAction, autorun, reaction, when} from 'mobx'
import {StoreExt} from '@utils/reactExt'
import {findIndex, uniqBy} from 'lodash'
import Generator from 'worker-loader!./generator'
import {
    sort,
    handleUserProp,
    handleWeiHisEmoji,
    handleTaglist,
    daHandler,
    handleFromScope
} from '@utils/utils'

const generator = new Generator()

class CustStore extends StoreExt {
    @observable userList: array = []
    // 筛选用户结果列表
    @observable filteredQuery: string = ''
    @observable filteredList: array = []
    @observable currUser: object = {}
    @observable loading: string = ''

    @observable pageid: number = 0
    @observable pages: number = 0
    @observable latest: number = 0
    @observable weiHis: array = []
    @observable fetching: string = ''

    @observable loadWeiHis: string = ''

    @observable sendmsg: array = []
    @observable sending: boolean = false

    @observable uplink: string = ''

    @observable order: number = 0
    @observable copyGuide: Object = {}

    @observable shutdown: number = 0
    @observable wakeup: number = 0
    @observable warnLoading: boolean = false
    @observable shutdownLoading: boolean = false
    @observable wakeupLoading: boolean = false

    @observable tabIndex: number = 1

    // 客服引导
    @observable chatTag: array = []
    @observable relaTag: object = {}
    @observable fetchTag: string = ''
    @observable addingTag: string = ''

    @observable guideList: array = []
    @observable fetchGuide: string = ''

    @observable klData: object = {}
    @observable currMsgId: number = 0
    @observable fetchkl: string = ''

    @observable sysconfig: array = []
    @observable fetchsys: string = ''

    // 推荐产品
    @observable rel_uid: number = 0
    @observable readyRelas: array = []
    @observable fetchReadyRelas: string = ''

    @observable recomHist: array = []
    @observable fetchRecomHist: string = ''

    @observable formScopeData: object = {}
    @observable fetchFormScope: string = ''

    @observable feeScope: object = {}
    @observable amountScope: object = {}
    @observable fetchTrial: string = ''

    @observable fetchInfoEdit: string = ''

    @observable filterProdParam: object = {}
    @observable filterProdData: object = {}
    @observable fetchFilterProd: string = ''

    @observable selectedRProdType = []
    @observable rProdList: object = {}
    @observable fetchrProd: string = ''

    @observable recomCompareData: object = {}
    @observable fetchRecomCompare: string = ''

    @observable checkProdRet: number = -1
    @observable fetchCheckProd: string = ''
    @observable checkProdMsg: string = ''

    @observable currForm: number = 1

    @observable reasonData: array = []
    @observable fetchReason: string = ''

    // 信息检索
    @observable fetchSearch: string = ''
    @observable searchList: object = {}

    @observable fetchBase: string = ''
    @observable BaseData: object = {}

    @observable fetchNoduty: string = ''
    @observable nodutyData: object = {}

    @observable fetchCompany: string = ''
    @observable companyData: object = {}

    @observable fetchComResult: string = ''
    @observable comResultData: object = {}

    @observable fetchReason: string = ''
    @observable reasonData: object = {}

    @observable fetchchange_insure: string = ''

    @observable fetchProdDel: string = ''

    // 控制全局按钮
    @observable showPList: boolean = false
    @observable showCList: boolean = false

    // 自动回复
    @observable fetchReplyList: string = ''
    @observable replyList: object = {}

    @observable fetchReplyAdd string = ''
    @observable replyAddData: object = {}

    @observable fetchReplyDel string = ''
    @observable replyDelData: object = {}

    @observable fetchReplyUpdate string = ''
    @observable replyUpdateData: object = {}

    @observable showAdd: boolean = false

    // 临时存储用户提交rel_uid
    @observable notifyRelUid: ''

    @observable replyCont = [
        {
            content: '您稍等，小诺为您核实一下，马上回来~'
        },
        {
            content: '感谢您的耐心等待，小诺回来咯'
        },
        {
            content: '稍等，小诺为您测算一下保费哦～'
        },
        {
            content: '小诺一一为您解答'
        },
        {
            content: '您对小诺给您推荐的产品有哪些疑问，都可以提出来哦，小诺帮您解答~'
        },
        {
            content: '呜呜呜~小诺给您解答的有些纰漏，正在重新解析问题答案，答案解析中,请稍后~'
        },
        {
            content: '网络塞车，小诺冲破重重阻拦回到您面前，立刻为您服务！'
        },
        {
            content: '小诺程序混乱推送信息有误，已经联系技术大大进行紧急修复，为了表达歉意，小诺送您么么哒，希望您能原谅~'
        }
    ]

    // 信息记录
    @observable fetchInfonote: string = ''
    @observable infonoteData: object = {}
    @observable infonoteMsg: string = ''

    // 保存信息记录
    @observable fetchInfonoteSave: string = ''
    @observable infonoteSaveData: object = {}
    @observable infonoteSaveMsg: string = ''

    @action
    custList = async (params): Promise<any> => {
        this.loading = 'start'

        let userList = []
        let currUser = {}

        try {
            let res = await this.api.custList(params)

            generator.postMessage({data: res, params: params})

            generator.addEventListener('message', msg => {
                this.userList = msg.data.userList
                this.currUser = msg.data.currUser
                this.loading = 'done'
            })

            reaction(
                () => this.currUser.openid,
                () => {
                    this.weihis({openid: this.currUser.openid})

                    // tag
                    this.getTags({
                        cuid: this.currUser.uid,
                        prod_id: '',
                        time: new Date().getTime()
                    })

                    // kl & guide
                    this.guide({
                        cuid: this.currUser.uid,
                        prod_id: '',
                        scene_id: ''
                    })

                    // recomhis
                    if (this.fetchRecomHist) {
                        this.recomHistory()
                    }

                    // kl
                    this.getkl({
                        id: this.currUser.id,
                        question: this.currUser.content
                    })

                    // readylist
                    if (this.fetchReadyRelas) {
                        this.readyList()
                    }

                    // 清除rel_uid
                    this.rel_uid = this.notifyRelUid ? this.notifyRelUid : this.currUser.uid

                    // 清除产品列表数据
                    if (this.fetchrProd) {
                        this.fetchrProd = ''
                        this.rProdList = {}
                        this.selectedRProdType = []
                    }

                    // 推荐产品（用户信息表单）
                    this.clearRecomHisAndFilterProd()

                    // 快捷回复
                    if (this.fetchRecomHist !== 'done') {
                        this.fastreply()
                    }

                    // 表单增加页面隐藏
                    this.showAdd = false

                    // 信息记录
                    this.infonoteFun({uid: this.currUser.uid})
                }
            )
        }
        catch (err) {
            console.log('-err: ', err)
        }
    }

    @action
    filterUser = (params): Object<any> => {
        this.filteredQuery = params
        this.filteredList = this.userList.filter(item => item.nickname.toLowerCase().includes(params))
    }

    @action
    showAddBox = (params): Object<any> => {
        this.showAdd = params

        // 增添取消按钮
        if (!params) {
            this.readyList()
        }
    }

    @action
    interval = (userList): Object<any> => {
        this.inTimer = setInterval(
            () => {
                //console.time('interval')
                userList = this.userList.map(item => {
                    if (!item.isexceed) {
                        item = handleUserProp(item)
                    }

                    return item
                })

                let hasUid = userList.some(item => +item.uid === +this.currUser.uid)

                if (!hasUid) {
                    userList[0].active = 1

                    this.currUser = userList[0]
                }

                const nore = userList.filter(it => it.highlight)
                    .sort((a, b) => +a.cdiff - +b.cdiff)
                //sort(nore, (a, b) => +a.cdiff - +b.cdiff)

                const isre = userList.filter(it => !it.highlight)
                    //.sort((a, b) => +a.cdiff - +b.cdiff)
                sort(isre, (a, b) => +a.cdiff - +b.cdiff)

                userList = [...nore, ...isre]
                //console.timeEnd('interval')

                this.userList = userList
                //postMessage(userList)
            },
            1000 * 1
        )
    }

    @action
    changeCurrUser = (user): Object<any> => {
        if (this.sending) {
            this.$message.warn('当前消息未发送完成，请不要切换用户哦')
            return false
        }

        this.currUser = user

        this.userList.forEach(item => {
            item.active = 0
            if (+item.uid === +user.uid) {
                item.active = 1
            }
        })
    }

    @action
    insertNewMsg = (data): Object<any> => {
        if (data.headimg) {
            data.headimg = data.headimg.replace('http://', 'https://')
        }

        let index = findIndex(this.userList, {uid: data.uid})

        if (index !== -1) {
            if (+data.rtype === 1) {
                this.userList[index] = {
                    ...this.userList[index],
                    isre: data.isre
                }
            }
            else {
                this.userList[index] = {
                    ...this.userList[index],
                    ...data,
                }
            }
        }
        else {
            this.userList = [data, ...this.userList]
        }
    }

    @action
    clearTimer = (params): Object<any> => {
        generator.terminate()
        clearInterval(this.inTimer)
    }

    @action
    weihis = async (params): Promise<any> => {
        if (params.pageid) {
            this.loadWeiHis = 'start'
        }
        else {
            this.fetching = 'start'
            this.weiHis = []
        }

        let chatCont = []

        try {
            let res = await this.api.weihis({
                hnum: 10,
                pageid: 0,
                ...params
            })

            runInAction('weihis', () => {
                let datas = res.datas.map(it => handleWeiHisEmoji(it))

                // 处理消息中的表情
                this.pageid = +res.pageid || 0
                this.pages = +res.pages
                this.loadWeiHis = 'done'
                this.fetching = 'done'

                if (params.pageid) {
                    let weiHis = [...res.datas, ...this.weiHis]

                    this.weiHis = uniqBy(weiHis, 'id')
                    this.latest = 0
                }
                else {
                    this.weiHis = uniqBy(res.datas, 'id')
                    this.latest = this.weiHis[this.weiHis.length - 1].id
                }
            })
        }
        catch (err) {
            this.loadWeiHis = 'done'
            this.fetching = 'done'
        }
    }

    @action
    insertWeiHis = (msg): Object<any> => {
        msg = handleWeiHisEmoji(msg)
        msg.da = msg.da || []
        msg.entity_info = msg.entity_info || []
        msg.nickname = +msg.rtype === 1 ? kuname : msg.nickname
        msg.id = msg.id || this.weiHis[this.weiHis.length - 1].id + 1

        let weiHis = [...this.weiHis, msg]
        sort(weiHis, (a, b) => +a.id - +b.id)
        // .sort((a, b) => {
        //     return +a.id - +b.id
        // })

        this.weiHis = uniqBy(weiHis, 'id')
        this.latest = this.weiHis[this.weiHis.length - 1].id
    }

    @action
    sendMsg = (data): Object<any> => {
        this.sending = true
        const msglist = (data.message || this.sendmsg).slice()
        const message = msglist.shift()

        this.sendmsg = msglist

        window.msgManager.typing({
            type: data.type,
            openid: this.currUser.openid,
            uid: this.currUser.uid
            kuid: kuid,
            kuname: kuname,
            time: new Date(),
            message: message
        })
    }

    @action
    serviceReply = (data): Object<any> => {
        this.insertWeiHis(data)
        this.insertNewMsg(data)

        let msglist = this.sendmsg.slice()

        if (msglist.length) {
            this.sendMsg({type: 'text'})
        }
        else {
            this.sending = false
        }
    }

    @action
    rmUser = (data): Object<any> => {
        let userList = this.userList.slice()

        this.userList = userList.filter(it => +it.id !== +this.currUser.id)
    }

    @action
    uploadurl = async (params): Promise<any> => {
        try {
            let res = await this.api.uploadurl(params)

            runInAction('uploadurl', () => {
                this.uplink = res
            })
        }
        catch (err) {

        }
    }

    @action
    upTabIndex = (data): Object<any> => {
        this.tabIndex = data.tabIndex
    }

    @action
    readyList = async (params): Promise<any> => {
        this.fetchReadyRelas = 'start'

        try {
            let res = await this.api.readylist({
                uid: this.currUser.uid
            })

            runInAction('readylist', () => {
                this.readyRelas = res
                this.fetchReadyRelas = 'done'
            })

            when(
                () => this.fetchReadyRelas === 'done',
                () => {
                    this.formScope({
                        rel_uid: this.rel_uid || this.readyRelas[0].customer_id_sub
                    })
                }
            )
        }
        catch (e) {

        }
    }

    @action
    switchWarn = async (params): Promise<any> => {
        if (params.action === 'info') {
            this.warnLoading = true
        }
        else {
            this[params.type + 'Loading'] = true
        }

        try {
            let res = await this.api.switchWarn(params)

            runInAction('switchWarn', () => {
                if (params.action === 'info') {
                    this.shutdown = +res.shutdown
                    this.wakeup = +res.wakeup
                }
                else {
                    this[params.type] = res ? +params.check : +!params.check
                }
            })
        }
        catch (err) {
            if (params.action !== 'info') {
                this[params.type] = +!params.check
            }
        }
        finally {
            this.warnLoading = false
            this.shutdownLoading = false
            this.wakeupLoading = false
        }
    }

    @action
    getTags = async (params): Promise<any> => {
        if (!params.isUpdate) {
            this.fetchTag = 'start'
        }

        try {
            let res = await this.api.getTags(params)

            res = handleTaglist(res)

            runInAction('gettags', () => {
                this.chatTag = res.chatTag
                this.relaTag = res.relaTag
                this.fetchTag = 'done'
            })
        }
        catch (err) {
            this.fetchTag = 'fail'
        }
    }

    @action
    addTag = async (params): Promise<any> => {
        this.addingTag = 'start'
        try {
            let res = await this.api.addTag(params)

            this.getTags({
                cuid: params.cuid,
                time: params.time,
                prod_id: '',
                isUpdate: true
            })

            runInAction('addtag', () => {
                this.addingTag = 'done'
            })
        }
        catch (err) {
            //this.$message.warn('添加标签出错')
            this.addingTag = 'fail'
        }
    }

    @action
    transTag = async (params): Promise<any> => {
        const {tagids, ...rest} = params
        try {
            let res = await this.api.delTag(params)

            let ret = await this.api.addTag(rest)

            this.getTags({
                cuid: params.cuid,
                time: params.time,
                prod_id: '',
                isUpdate: true
            })
        }
        catch (err) {
            this.$message.warn('标签移动出错')
        }
    }

    @action
    delTag = async (params): Promise<any> => {
        try {
            let res = await this.api.delTag(params)
        }
        catch (err) {
            this.$message.warn('标签删除出错')
        }
    }

    @action
    switchTag = async (params): Promise<any> => {
        try {
            let res = await this.api.switchTag(params)

            this.getTags({
                cuid: params.cuid,
                time: params.time,
                prod_id: '',
                isUpdate: true
            })

            runInAction('switchTag', () => {
            })
        }
        catch (err) {
            this.$message.warn('标签切换高亮出错')
        }
    }

    @action
    guide = async (params): Promise<any> => {
        this.fetchGuide = 'start'
        try {
            let res = await this.api.guide(params)

            res.da = JSON.stringify(res.commands)

            res = daHandler(res)

            runInAction('guide', () => {
                this.guideList = res.guide
                this.fetchGuide = 'done'
            })
        }
        catch (err) {
            this.fetchGuide = 'fail'
        }
    }

    @action
    getkl = async (params): Promise<any> => {
        this.fetchkl = 'start'
        try {
            let res = await this.api.knowledge({
                ...params,
                openid: this.currUser.openid,
                step: 0
            })

            res = daHandler(res[0])

            runInAction('getkl', () => {
                this.currMsgId = +params.id
                this.klData = res
                this.guideList = res.guide
                this.fetchkl = 'done'
            })
        }
        catch (err) {
            this.fetchkl = 'fail'
        }
    }

    @action
    hitslead = async (params): Promise<any> => {
        try {
            let res = await this.api.hitslead({
                ...params,
                uid: this.currUser.uid,
                wechat_nick: this.currUser.nickname
            })
        }
        catch (e) {
        }
    }

    @action
    upCopyMsg = (data): Object<any> => {
        this.copyGuide = data
    }

    @action
    sconfig = async (params): Promise<any> => {
        this.fetchsys = 'start'
        try {
            let res = await this.api.allkf()

            const {kflist, ...rest} = res

            runInAction('sysconfig', () => {
                this.sysconfig = rest
                this.fetchsys = 'done'
            })
        }
        catch (e) {

        }
    }

    // 更换范围则更新产品列表
    @action
    formScope = async (params, type): Promise<any> => {
        // 搜索产品获取用户信息不更新
        if (type !== 'search') {
            this.selectedRProdType = []
        }
        //this.rProdList = {}
        this.fetchInfoEdit = ''
        this.fetchFormScope = 'start'
        this.formScopeData = {}
        this.rel_uid = params.rel_uid

        try {
            let res = await this.api.formScope({
                ...params,
                uid: this.currUser.uid
            })

            res = handleFromScope(res) || {}

            // 搜索产品获取用户信息不更新
            if (type !== 'search') {
                this.fetchrProd = ''
                this.prodList({list: 1, rel_uid: params.rel_uid}, this.selectedRProdType)
            }

            runInAction('formScope', () => {
                this.fetchFormScope = 'done'
                this.formScopeData = res
            })

        }
        catch (err) {
            this.fetchFormScope = 'fail'

            reporter({
                uid: this.currUser.uid,
                uname: this.currUser.nickname,
                name: err.name,
                stack: err.stack,
                message: err.message
            })
        }
    }

    @action
    trial = async (params): Promise<any> => {
        this.fetchTrial = 'start' + params.key

        try {
            let res = await this.api.trial(params)

            runInAction('trial', () => {
                this.fetchTrial = 'done'

                if (params.key === 'amount') {
                    this.feeScope = res.insure.feescope
                }
                else {
                    this.amountScope = res.insure.amountscope
                }
            })
        }
        catch (e) {
            this.fetchTrial = 'fail'
        }
    }

    @action
    upFormScopeData = async (params): Promise<any> => {
        this.fetchInfoEdit = 'start'

        try {
            let res = await this.api.infoedit({
                ...params.insure,
                kuid: window.kuid,
                uid: this.currUser.uid,
            })

            runInAction('infoedit', () => {
                this.formScopeData[params.cate] = params.data
                this.fetchInfoEdit = 'done'
                this.rel_uid = res.rel_uid
            })

            // 新增用户不做处理
            if (params.type !== 'add') {
                this.readyList()
            }
        }
        catch (e) {
            this.fetchInfoEdit = ''
            this.$message.warn('保存表单信息失败')
        }
    }

    @action
    filterProd = async (params): Promise<any> => {
        this.fetchFilterProd = 'start'

        try {
            params = {
                ...this.filterProdParam,
                ...params
            }

            let res = await this.api.filterProd(params)

            runInAction('filterProd', () => {
                this.fetchFilterProd = 'done'
                this.filterProdParam = params
                this.filterProdData = {
                    list: res.prods,
                    page: res.page
                }
            })
        }
        catch (e) {
            this.$message.warn('筛选产品失败')
            this.fetchFilterProd = ''
        }
    }

    @action
    recomHistory = async (params): Promise<any> => {
        this.fetchRecomHist = 'start'
        try {
            let res = await this.api.recomHistory({
                uid: this.currUser.uid
            })

            runInAction('recomHistory', () => {
                this.fetchRecomHist = 'done'
                this.recomHist = res
            })
        }
        catch (e) {
            this.fetchRecomHist = 'fail'
            this.recomHist = []
        }
    }

    @action
    clearRecomHisAndFilterProd = (data): Object<any> => {
        // 清推荐书
        this.recomHist = []
        this.fetchRecomHist = ''

        // 清筛选产品
        this.filterProdData = {}
        this.filterProdParam = {}
        this.fetchFilterProd = ''

        // 清表单保存信息
        this.fetchInfoEdit = ''
    }

    @action
    prodList = async (params, selected): Promise<any> => {
        this.fetchrProd = 'start'
        this.rProdList = {}
        this.selectedRProdType = []

        try {
            let res = await this.api.prodList({
                rel_uid: this.rel_uid || this.readyRelas[0].customer_id_sub,
                kuid: window.kuid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('prodList', () => {
                this.rProdList = res || {}
                this.fetchrProd = 'done'
                this.selectedRProdType = selected
            })
        }
        catch (e) {
            this.fetchrProd = 'fail'
        }
    }

    @action
    upRProdList = (data): Object<any> => {
        try {
            if (data.type === 'remove') {
                this.selectedRProdType = this.selectedRProdType.filter(item => +item !== +data.ptid)
            }
            else if (!this.selectedRProdType.includes(+data.ptid)) {
                this.selectedRProdType.push(+data.ptid)
            }

            this.rProdList[data.pkey].prods.forEach(item => {
                if (+item.pid === +data.pid) {
                    item.selected = !item.selected
                }
            })
        }
        catch (err) {

        }
    }

    @action
    recomCompare = async (params): Promise<any> => {
        this.fetchRecomCompare = 'start'

        try {
            let res = await this.api.recomcompare({
                kuid: window.kuid,
                uid: this.currUser.uid,
                rel_uid: this.rel_uid,
                pid: this.recomCompareData.pid || '',
                pids: this.recomCompareData.pids || '',
                ...params
            })

            runInAction('recomCompare', () => {
                this.fetchRecomCompare = 'done'
                this.recomCompareData = {
                    name: res.name,
                    code: res.code,
                    addtime: res.addtime,
                    pid: res.pid,
                    pids: res.pids,
                    url: res.url
                }
            })
        }
        catch (err) {
            this.fetchRecomCompare = 'fail'
        }
    }

    // 校验是否可购买产品
    @action
    checkProd = async (params): Promise<any> => {
        this.fetchCheckProd = 'start'
        this.checkProdRet = ''
        this.fetchRecomCompare = ''
        this.recomCompareData = {}

        try {
            let res = await this.api.checkProd({
                uid: this.currUser.uid,
                openid: this.currUser.openid,
                ...params
            })

            runInAction('checkProd', () => {
                this.fetchCheckProd = 'done'
                this.checkProdRet = 0
            })
        }
        catch (err) {
            this.checkProdMsg = err.stack
            this.fetchCheckProd = 'fail'
        }
    }

    @action
    upCurrForm = (data): Object<any> => {
        this.currForm = data.ptid
    }

    @action
    reason = async (params): Promise<any> => {
        this.fetchReason = 'start'

        try {
            let res = await this.api.reason({
                uid: this.currUser.uid,
                rel_uid: this.rel_uid,
                ...params
            })

            runInAction('reason', () => {
                this.fetchReason = 'done'
                this.reasonData = res.prods
            })
        }
        catch (err) {
            this.fetchReason = 'fail'
        }
    }

    @action
    upReasonData = (data): Object<any> => {
        const reason = this.reasonData.slice()

        switch (data.type) {
            case 'del':
                reason.forEach(prod => {
                    if (+prod.pid === +data.pid) {
                        prod.reasonlist = prod.reasonlist.filter(it => +it.id !== +data.id)
                    }
                })
                break
            case 'edit':
                reason.forEach(prod => {
                    if (+prod.pid === +data.pid) {
                        prod.reasonlist.forEach(it => {
                            if (+it.id === +data.id) {
                                it.edit = true
                            }
                        })
                    }
                })
                break
            case 'save':
                reason.forEach(prod => {
                    if (+prod.pid === +data.pid) {
                        prod.reasonlist.forEach(it => {
                            if (+it.id === +data.id) {
                                it.edit = false
                                it.value = data.cont || it.value
                            }
                        })
                    }
                })
                break
            case 'add':
                reason.forEach(prod => {
                    if (+prod.pid === +data.pid) {
                        prod.reasonlist.unshift({
                            edit: true,
                            id: Math.random(),
                            key: 0,
                            pkey: 0,
                            value: ''
                        })
                    }
                })
                break
        }

        this.reasonData = reason
    }

    // 医疗 高端医疗 的推荐书
    @action
    ylrecom = async (params): Promise<any> => {
        this.fetchRecomCompare = 'start'

        try {
            let res = await this.api.result({
                kuid: window.kuid,
                rel_uid: this.rel_uid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('ylrecom', () => {
                this.fetchRecomCompare = 'done'
                this.recomCompareData = {
                    name: res.name,
                    code: res.code,
                    addtime: res.addtime,
                    pid: res.pid,
                    id: res.id,
                    pids: res.pids,
                    url: res.url
                }
            })
        }
        catch (err) {
            this.fetchRecomCompare = 'fail'
        }
    }

    @action
    recom = async (params): Promise<any> => {
        this.fetchRecomCompare = 'start'

        try {
            let res = await this.api.reasonResult({
                kuid: window.kuid,
                rel_uid: this.rel_uid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('recom', () => {
                this.fetchRecomCompare = 'done'
                this.recomCompareData = {
                    name: res.name,
                    code: res.code,
                    addtime: res.addtime,
                    pid: res.pid,
                    id: res.id,
                    pids: res.pids,
                    url: res.url
                }
            })
        }
        catch (err) {
            this.fetchRecomCompare = 'fail'
        }
    }

    @action
    sendStatus = async (params): Promise<any> => {
        try {
            let res = await this.api.sendStatus({
                kuid: window.kuid,
                uid: this.currUser.uid,
                openid: this.currUser.openid,
                ...params
            })

            // 接口形式推送消息 需要再次重新拉去历史记录才能显示出消息
            this.weihis({openid: this.currUser.openid})

            this.userList = this.userList.map(it => {
                if (it.openid === this.currUser.openid) {
                    it.isre = 1
                }

                return it
            })
            console.log('---------res: ', res)
        }
        catch (err) {
            console.log('====catch err: ', err)
        }
    }

    @action
    trace = async (params): Promise<any> => {
        try {
            let res = await this.api.trace({
                ...params,
                kuid: kuid,
                uid: this.currUser.uid,
                openid: this.currUser.openid,
                nickname: this.currUser.nickname,
                channel: 'crm',
                platform: 'pc'
            })
        }
        catch (e) {
        }
    }

    @action
    getSearch  = async (params): Promise<any> => {
        this.fetchSearch = 'start'

        try {
            params = {
                ...params
            }

            let res = await this.api.getSearch({
                ...params,
                uid: this.currUser.uid
            })

            runInAction('getSearch', () => {
                this.fetchSearch = 'done'
                this.searchList = res
            })
        }
        catch (e) {
            this.fetchSearch = 'fail'
        }
    }

    @action
    getBase = async (params): Promise<any> => {
        this.fetchBase = 'start'

        try {
            let res = await this.api.getBase({
                ...params,
                uid: this.currUser.uid
            })

            runInAction('getBase', () => {
                this.fetchBase = 'done'
                this.BaseData = res
            })
        }
        catch (e) {
            this.fetchBase = 'fail'
        }
    }

    @action
    getNoduty = async (params): Promise<any> => {
        this.fetchNoduty = 'start'

        try {
            let res = await this.api.noduty({
                ...params
            })

            runInAction('getNoduty', () => {
                this.fetchNoduty = 'done'
                this.nodutyData = res
            })
        }
        catch (e) {
            this.fetchNoduty = 'fail'
        }
    }

    @action
    getCompany = async (params): Promise<any> => {
        this.fetchCompany = 'start'

        try {
            let res = await this.api.company({
                kuid: window.kuid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('getCompany', () => {
                this.fetchCompany = 'done'
                this.companyData = res
            })
        }
        catch (e) {
            this.fetchCompany = 'fail'
        }
    }

    @action
    change_insure = async (params, index, from): Promise<any> => {
        this.fetchchange_insure = 'start'

        try {
            let res = await this.api.change_insure(params)

            runInAction('change_insure', () => {
                this.fetchchange_insure = 'done'

                if(from === 'search') {
                    if (params.insure.charge) {
                        if (+res.insure.scope.cover.indexOf(this.searchList.prods[index].insure.cover) === -1) {
                            this.searchList.prods[index].insure.cover = ''
                        }

                        this.searchList.prods[index].insure.charge = params.insure.charge
                        this.searchList.prods[index].insure.scope.cover = res.insure.scope.cover
                    }

                    if (params.insure.cover) {
                        if (+res.insure.scope.charge.indexOf(this.searchList.prods[index].insure.charge) === -1) {
                            this.searchList.prods[index].insure.charge = ''
                        }

                        this.searchList.prods[index].insure.scope.charge = res.insure.scope.charge
                        this.searchList.prods[index].insure.cover = params.insure.cover
                    }
                }
                else {
                    if (params.insure.charge) {
                        if (+res.insure.scope.cover.indexOf(this.filterProdData.list[index].insure.cover) === -1) {
                            this.filterProdData.list[index].insure.cover = ''
                        }

                        this.filterProdData.list[index].insure.charge = params.insure.charge
                        this.filterProdData.list[index].insure.scope.cover = res.insure.scope.cover
                    }

                    if (params.insure.cover) {
                        if (+res.insure.scope.charge.indexOf(this.filterProdData.list[index].insure.charge) === -1) {
                            this.filterProdData.list[index].insure.charge = ''
                        }

                        this.filterProdData.list[index].insure.scope.charge = res.insure.scope.charge
                        this.filterProdData.list[index].insure.cover = params.insure.cover
                    }
                }
            })
        }
        catch (err) {
        }
    }

    @action
    companyResult = async (params): Promise<any> => {
        this.fetchComResult = 'start'

        try {
            let res = await this.api.companyResult({
                kuid: window.kuid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('companyResult', () => {
                this.fetchComResult = 'done'

                // 接口返回公司对比链接多一个(s)
                if (res && res.url) {
                    res.url = res.url.replace('https', 'http')
                }

                this.comResultData = res

            })
        }
        catch (e) {
            this.fetchComResult = 'fail'
        }
    }

    @action
    comDel = async (params): Promise<any> => {
        this.fetchComDel = 'start'

        try {
            let res = await this.api.comDel({
                kuid: window.kuid,
                uid: this.currUser.uid,
                ...params
            })

            runInAction('comDel', () => {
                this.fetchComDel = 'done'

                if (res === true && params.del === 'all') {
                    this.companyData = {}
                }
                else {
                    this.companyData = this.companyData.filter(item => item.company_id != params.id)
                }
            })
        }
        catch (e) {
            this.fetchComResult = 'fail'
        }
    }

    @action
    prodsline_del = async (params, pid): Promise<any> => {
        this.fetchProdDel = 'start'

        try {
            let res = await this.api.prodsline_del(params)

            runInAction('prodsline_del', () => {
                this.fetchProdDel = 'done'
            })
        }
        catch (err) {

        }
    }

    @action
    changeShowBtn = (data): Object<any> => {
        if (data.type === 'prod') {
            this.showPList = data.flag
        }
        else {
            this.showCList = data.flag
        }
    }

    @action
    fastreply = async (params): Promise<any> => {
        this.fetchReplyList = 'start'

        try {
            let res = await this.api.fastreply({
                kuid: window.kuid
            })

            runInAction('fastreply', () => {
                this.fetchReplyList = 'done'
                this.replyList = res

                if (!this.replyList.length) {
                   this.replyCont =  this.replyCont.map(item => {
                        item.kuid = window.kuid

                        return item
                    })
                    this.replyAdd(this.replyCont)
                }
            })
        }
        catch (err) {

        }
    }

    @action
    replyAdd = async (params): Promise<any> => {
        this.fetchReplyAdd = 'start'

        try {
            let res = await this.api.replyAdd(params)

            runInAction('replyAdd', () => {
                this.fetchReplyAdd = 'done'
                this.replyAddData = res

                this.fastreply()
            })
        }
        catch (err) {

        }
    }

    @action
    replyDel = async (params): Promise<any> => {
        this.fetchReplyDel = 'start'

        try {
            let res = await this.api.replyDel({
                kuid: window.kuid,
                ...params
            })

            runInAction('replyDel', () => {
                this.fetchReplyDel = 'done'
                this.replyAddData = res

                this.fastreply()
            })
        }
        catch (err) {

        }
    }

    @action
    replyUpdate = async (params): Promise<any> => {
        this.fetchReplyUpdate = 'start'

        try {
            let res = await this.api.replyUpdate({
                kuid: window.kuid,
                ...params
            })

            runInAction('replyUpdate', () => {
                this.fetchReplyUpdate = 'done'
                this.replyUpdateData = res

                this.fastreply()
            })
        }
        catch (err) {

        }
    }

    // 记录用户提交表单rel_uid
    @action
    notifyRel = (data): Object<any> => {
        this.notifyRelUid = data
    }

    @action
    infonoteFun = async (params): Promise<any> => {
        this.fetchInfonote = 'start'

        try {
            let res = await this.api.infoNotelist(params)

            runInAction('infonoteFun', () => {
                this.fetchInfonote = 'done'
                this.infonoteData = res
                this.infonoteMsg = '获取信息记录成功'
            })
        }
        catch (err) {
            runInAction('infonoteFun', () => {
                this.fetchInfonote = 'done'
                this.infonoteMsg = '获取信息记录失败'
            })
        }
    }

    @action
    infonoteSaveFun = async (params): Promise<any> => {
        this.fetchInfonoteSave = 'start'

        try {
            let res = await this.api.infonoteSave(params)

            runInAction('infonoteFun', () => {
                this.fetchInfonoteSave = 'done'
                this.infonoteSaveData = res
                this.infonoteSaveMsg = '保存信息记录成功'
            })
        }
        catch (err) {
            runInAction('infonoteFun', () => {
                this.fetchInfonoteSave = 'done'
                this.infonoteSaveMsg = '保存信息记录失败'
            })
        }
    }

}

const custStore = new CustStore()

export default custStore
