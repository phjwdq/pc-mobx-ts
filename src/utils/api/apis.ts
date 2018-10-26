/**
 * @file 接口地址映射
 * @author luwenlong
 */

export default {
    // 登录
    login: '/crm/main/login',
    // 用户统计
    dataStat: '/crm/main/v2/data_stat',
    // 查询客户
    userSearch: '/crm/custquery/usersearch',
    // 查询客服
    custSearch: '/crm/main/v2/kf_list',
    // 沟通图表
    homeGraph: '/crm/main/v2/focus_communication',
    // 商机消息
    opporNews: '/crm/main/oppor_news',
    // 未读消息
    weiMsgNum: '/api/weixin/weimsgnum',
    // 转接消息
    transGlobal: '/crm/custmanage/transfer_global',
    // 获取推荐书
    unRecomm: '/crm/recommend/message_prods',
    // 通知 推荐书已读
    readRecomm: '/crm/recommend/message_read',
    // 切换客服状态
    changeBusy: '/crm/main/busy',
    // 登出
    logout: '/crm/main/login_out',
    // 右下角 提醒消息
    corTips: '/crm/recommend/warn',
    // 右下角 推送列表
    comList: '/crm/recommend/CommitLists',
    // 用户列表
    custList: '/api/weixin/weitalkings',
    // 历史消息记录
    //weihis: '/api/weixin/weihis',
    weihis: '/im/imchat',
    // 客户分配
    assign: '/crm/custquery/assign',
    // 获取所有客服
    allkf: '/crm/main/config',
    // 获取上传链接
    uploadurl: '/crm/recommend/uploadurl',
    // 已添加的客户关系
    readylist: '/crm/recommend/readylist',
    // 自动提醒开关
    switchWarn: '/crm/main/onoff',
    // 获取tag列表
    getTags: '/api/guide/tag_list',
    // 删除tag
    delTag: '/api/guide/tag_delete',
    // 切换激活tag
    switchTag: '/api/guide/tag_activate',
    // 添加tag
    addTag: '/api/guide/tag_add',
    // 获取引导话术
    guide: '/api/guide/scene',
    // 获取知识点
    knowledge: '/api/weixin/weitalkstep',
    // 内容需修改
    hitslead: '/crm/recommend/hitslead',
    // 获取表单选项的范围
    formScope: '/crm/recommend/infoscope',
    // 历史推荐/计划书
    recomHistory: '/crm/recommend/prodlists',
    // 推荐产品-产品列表
    prodList: '/crm/prospectus/Lists',
    // 试算
    trial: '/crm/recommend/trial',
    // 保存表单信息
    infoedit: '/crm/recommend/infoedit',
    // 筛选产品
    filterProd: '/crm/recommend/submit',
    // 统计
    trace: '/api/user/trace',
    // 信息检索
    getSearch: '/partner/search/kf_search',
    // 生成对比书
    recomcompare: '/crm/recommend/recomcompare',
    // 校验prod
    checkProd: '/crm/recommend/check_prod',
    // 推荐原因
    reason: '/crm/prospectus/reason',
    // 医疗 高端医疗推荐书
    result: '/crm/recommend/result',
    // 重疾险，防癌险，意外险
    reasonResult: '/crm/prospectus/result',
    // 信息检索 素材转base64
    getBase: '/partner/util/img/base64',
    // 推荐书发送状态
    sendStatus: '/crm/recommend/sendstatus',
    // 推荐产品免责条款
    noduty: '/crm/recommend/noduty',
    // 公司对比列表
    company: '/crm/company/lists',
    // 客户信息 缴费期限 保障期限
    change_insure: '/partner/kfsys/change_insure',
    // 生成公司对比
    companyResult: '/crm/company/result',
    // 删除公司列表
    comDel: 'crm/company/del',
    // 推荐产品-产品列表-删除
    prodsline_del: '/crm/recommend/prodsline_del',
    // 自动回复列表
    fastreply: '/crm/fastreply/select',
    replyAdd: '/crm/fastreply/add',
    replyDel: '/crm/fastreply/delete',
    replyUpdate: '/crm/fastreply/update',
    // 表单提醒删除
    commitRead: '/crm/recommend/CommitRead',
    // 信息记录
    infoNotelist: '/crm/recommend/notelist',
    // 保存信息记录
    infonoteSave: '/crm/recommend/noteedit'
}
