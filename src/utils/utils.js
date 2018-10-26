/**
 * @file 工具集
 * @author luwenlong
 */

import emoji from '@assets/emojihash.json'
import {remove, findIndex} from 'lodash'
import guideTable from '@assets/guide.json'
import prov from '@assets/prov.json'
import moment from 'moment'

/**
 * @description 解析倒计时
 *
 * @params string time 日期字符串
 * @return Object 倒计时
 */
export function parseTimeBak(time) {
    let cnow = new Date().getTime()
    let ctime = new Date(time).getTime()

    let cdiff = parseInt(cnow - ctime, 10)
    let diff = parseInt(cdiff / 1000, 10)

    if (diff < 0) {
        return {
            time: time,
            diff: 0,
            text: '时间有误'
        }
    }

    let h = diff >= 3600 ? parseInt(diff / 3600, 10) : 0
    let m = h ? parseInt((diff - 3600 * h) / 60, 10) : parseInt(diff / 60, 10)
    let s = diff % 60

    let ret = ''

    // exceed 超过48小时不再计算倒计时
    if (h >= 48) {
        return {
            time: time,
            diff: cdiff,
            exceed: 1,
            text: h + '小时前'
        }
    }

    if (h) {
        ret += h + '小时'
    }

    if (m) {
        ret += m + '分钟'
    }

    if (s) {
        ret += s + '秒'
    }

    if (!ret) {
        ret = '0秒'
    }

    return {
        time: time,
        diff: cdiff,
        text: ret + '前'
    }
}

export function parseTime(time) {
    const now = moment().format('YYYY-MM-DD HH:mm:ss')
    const ctime = moment(time).format('YYYY-MM-DD HH:mm:ss')
    const diff = moment(now, 'YYYY-MM-DD HH:mm:ss').diff(moment(ctime, 'YYYY-MM-DD HH:mm:ss'))
    const d = moment.duration(diff)
    const {days, hours, minutes, seconds} = d._data

    if (moment().isBefore(moment(ctime))) {
        return {
            time: time,
            diff: -1,
            text: '时间有误'
        }
    }

    if (diff > 48 * 3600000) {
        return {
            diff: diff,
            text: parseInt(diff / 3600000) + '小时前',
            time: time
        }
    }
    else if (diff > 0) {
        let _txt = days * 24 + hours
            ? (days * 24 + hours) + '小时' + minutes + '分' + seconds + '秒前'
            : minutes
            ? minutes + '分' + seconds + '秒前'
            : seconds + '秒前'

        return {
            diff: diff,
            text: _txt,
            time: time
        }
    }

    return {
        time: time,
        diff: diff,
        text: '时间有误'
    }
}

const INDEX = Symbol('index')

/**
 * @description 排序
 *
 */
export function sort(array, compare) {
    array = array.map((item, index) => {
        if (typeof item === 'object') {
            item[INDEX] = index
        }

        return item
    })

    return array.sort((left, right) => {
        const result = compare(left, right)

        return result === 0 ? left[INDEX] - right[INDEX] : result
    })
}

/**
 * @description 获取指定范围(闭区间)的随机数
 *
 */
export function random(min, max) {
    return parseInt(Math.random() * (max - min + 1) + min, 10)
}

/**
 * @descriptio n位数字补足0
 *
 * @param num 待补位数字
 * @param n n位数字
 */
export function repeat(num, n = 3) {
	return new Array(n - String(num).length).fill('0').join('') + num
}

/**
 * @description 用户属性处理
 *
 */
export function handleUserProp(item) {
    try {
        let cutobj = parseTime(item.ctime || item.last_time)

        item.ctime = cutobj.time
        item.ctext = cutobj.text
        item.cdiff = cutobj.diff
        item.isexceed = cutobj.exceed

        // fix me 缓存正在编辑的内容 暂时去掉该功能
        item.cacheEditing = ''

        item.nickname = item.nickname || '未获得昵称'
        item.headimg = item.headimg || 'https://www.innolife.cc/wap/headimg/avatar.png'
        item.headimg = item.headimg.replace('http://', 'https://')

        switch (item.mtype) {
            case 'image':
                item.content = '用户发送一张图片'
                break
            case 'voice':
                item.content = '用户发送一段语言'
                break
        }

        // 处理消息中的表情
        for (let prop in emoji) {
            if (emoji.hasOwnProperty(prop) && item.content.indexOf(prop) !== -1) {
                item.content = item.content.split(prop).join(`<img class='emoji' src="https://www.innolife.cc/wap/wechatemoji/${emoji[prop].pic}" alt=${emoji[prop].text} title=${emoji[prop].text} />` )
            }
        }

        switch (item.applets_type) {
            case 'hk_demo':
                item.channelName = '弘康demo'
                break
            case 'nyb':
                item.channelName = '叮当保客服'
                break
            case 'hxa':
                item.channelName = '慧馨安'
                break
            case 'bzfa':
                item.channelName = '定方案'
                break
            case 'qsc':
                item.channelName = '轻松筹'
                break
            case 'zdwd':
                item.channelName = '重疾知道'
                break
            case 'app_demo_180509':
                item.channelName = ''
                break
            default:
                item.channelName = ''
                break
        }

        // 高亮提醒
        // 1. 超过1分钟 未回复
        // 2. 已经是飘红 客户又来消息 继续飘红 不重新计算1分钟
        // 3. 固定路径不参加飘红 TODO
        if ((item.cdiff > 60000 && +item.isre === 0)
            || (+item.highlight === 1 && +item.isre === 0)
        ) {
            item.highlight = 1
        }
        else {
            item.highlight = 0
        }

        return item
    }
    catch (err) {
        console.log('处理用户属性出错: ', err)
    }
}

/**
 * @description 判断元素是否在可视区域
 *
 * @param el 目标元素
 */
export function isElementInViewport(el) {
    const rect = el.getBoundingClientRect()
    return (
        rect.top >= 0
        && rect.left >= 0
        && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
}

/**
 * @description 处理消息中的表情
 *
 * @param item 消息体
 */
export function handleWeiHisEmoji(item) {
    if (item.mtype === 'image' && typeof item.content === 'string') {
        item.content = item.content.replace('http://123.57.81.151:8085', 'https://www.inno-life.cc/im')
    }

    for (let prop in emoji) {
        if (item.mtype === 'text' && emoji.hasOwnProperty(prop) && item.content.indexOf(prop) !== -1) {
            item.content = item.content.split(prop).join(`<img class='emoji' src="https://www.innolife.cc/wap/wechatemoji/${emoji[prop].pic}" alt=${emoji[prop].text} title=${emoji[prop].text} />` )
        }
    }

    return item
}

/**
 * @description 处理标签数据
 *
 * @param taglist 标签列表
 * @param relation 目标关系
 */
export function handleTaglist(tags, relation) {
    let tagList = tags.filter(it => guideTable[it.name])

    let chatTag = remove(tagList, item => +item.relation === -1 && +item.source === 1)

    chatTag.forEach(it => {
        it.cname = guideTable[it.name]
    })

    let relaTag = {}

    tagList.filter(it => it.rel_name)
    .forEach(item => {
        if (!relaTag[item.rel_name]) {
            relaTag[item.rel_name] = [item]
        }
        else {
            relaTag[item.rel_name].push(item)
        }

        item.cname = guideTable[item.name]
    })


    return {
        chatTag,
        relaTag
    }
}

/**
 * @description 客服引导数据处理
 * @param {Object} data 初始数据源
 *
 * @return {Object} guideData 处理后数据
 */
export function daHandler(data) {
    if (!data.da) {
        return {
            id: data.id,
            ctime: data.ctime,
            question: data.content || '',
            knowledge: [],
            guide: [],
            // recommend: []
        }
    }

    try {
        let knowledge = []
        let guide = []
        // let recommend = []

        const da = JSON.parse(data.da)

        da.forEach(item => {
            // 1. 知识点
            // 2. 推荐话术
            // 3. 引导话术
            switch (item.type) {
                case 1:
                    fillData(item, knowledge)
                    break;
                case 2:
                    fillData(item, knowledge)
                    break;
                default:
                    fillData(item, guide)
                    break;
            }
        })

        /**
         * @description 填充数据
         * @param {Array} item 数据源
         * @param {Array} category 分组数据
         *
         * 每个item是单独数据，所以不需要再判断item.id对多条数据进行合并
         * item.elements[]只取type:1 作为[kl/guide].content
         * [kl/guide]title来自properties[{key: title}] 之前遍历elements取type:2
         */
        function fillData(item, category) {
            item.elements.forEach(ele => {
                ele.content = ele.content.replace(/<EOS>/ig, '{{EOS}}')

                let title = ''

                if (Array.isArray(item.properties)) {
                    item.properties.forEach(it => {
                        if (/^title$/ig.test(it.key)) {
                            title = it.value
                        }
                    })
                }

                if (ele.type == 1) {
                    category.push({
                        pid: item.id,
                        id: ele.id,
                        title: title,
                        content: ele.content,
                        kvs: item.properties || []
                    })
                }
            })
        }

        function fillDataBak(item, category) {
            item.elements.forEach(ele => {
                // 如果id相同，整合到一条信息中
                // 如果id不同，作为新信息
                // 新逻辑: 每条item作为一条数据处理 内层type 1:content 2:title 3:guide
                let index = findIndex(category, ['pid', item.id])

                ele.content = ele.content.replace(/<EOS>/ig, '{{EOS}}')

                // 不存在 新数据
                if (index == -1) {
                    if (ele.type == 1) {
                        category.push({
                            pid: item.id,
                            id: ele.id,
                            content: ele.content,
                            kvs: item.properties || []
                        })
                    }
                    else if (ele.type == 2) {
                        category.push({
                            pid: item.id,
                            id: ele.id,
                            title: ele.content,
                            kvs: item.properties || []
                        })
                    }
                    else {
                        category.push({
                            pid: item.id,
                            id: ele.id,
                            guide: ele.content,
                            kvs: item.properties || []
                        })
                    }
                }
                else {
                    if (ele.type == 1) {
                        category[index].content = ele.content
                    }
                    else if (ele.type == 2) {
                        category[index].title = ele.content
                    }
                    else {
                        category[index].guide = ele.content
                    }
                }
            })
        }

        // 整合数据
        let guideData = {
            id: data.id,
            ctime: data.ctime,
            question: data.content,
            knowledge: knowledge,
            guide: guide
        }

        let hasguide = false;
        for (let i = 0, len = guide.length; i < len; i++) {
            if (guide[i].content) {
                hasguide = true;
                break;
            }
        }

        if (!hasguide) {
            guideData.guide = [];
        }

        return guideData;
    }
    catch (e) {
        console.log('处理客服引导信息数据出错: ', e);

        return {
            id: data.id,
            ctime: data.ctime,
            question: data.content || '',
            knowledge: [],
            guide: [],
            // recommend: []
        }
    }
}

/**
 * @description 整合表单数据
 *
 */
export function handleFromScope(data) {
    try {
        // if (!data.info) {
        //     reporter({
        //         message: '险种表单数据没有返回info数据'
        //     })

        //     return {}
        // }

        // 为谁投保
        let relation = []
        for (let key in data.relation) {
            relation.push({
                key: key,
                value: data.relation[key]
            })
        }

        // 社保
        let social = ''
        data.insure.scope.social.forEach(tem => {
            if (data.info && +tem.key === +data.info.socialsecurity) {
                social = tem.value
            }
        })

        // 商业保险
        let insurance = ''
        data.insure.scope.socials.forEach(tem => {
            if (data.info && +tem.key === +data.info.insurance) {
                insurance = tem.value
            }
        })

        // 保险类型 级联
        const accident = data.pcfilters.accident.map(it => {
            return {
                ...it,
                value: '' + it.key,
                label: it.value
            }
        })

        data.pcfilters.caccident.forEach(item => {
            const index = findIndex(data.pcfilters.accident, ['key', item.pkey])

            if (accident[index].children) {
                accident[index].children.push({
                    ...item,
                    value: '' + item.key,
                    label: item.value
                })
            }
            else {
                accident[index].children = [{
                    ...item,
                    value: '' + item.key,
                    label: item.value
                }]
            }
        })

        let accidentValue = ''
        let accidentKey = ''

        if (data.info && data.info.accident) {
            accidentValue = data.info.accident.value
            accidentKey = data.info.accident.key
        }

        if (data.info && data.info.caccident) {
            accidentValue += ',' + data.info.caccident.value
            accidentKey += ',' + data.info.caccident.key
        }

        // 投保人性别(重疾险+防癌险)
        let zholder_sex = ''
        data.holder.scope.sex.forEach(tem => {
            if (data.info && +tem.key === +data.info.zholder_sex) {
                zholder_sex = tem.value
            }
        })

        // 投保人性别（高端医疗险）
        let holder_sex = ''
        data.holder.scope.sex.forEach(tem => {
            if (data.info && +tem.key === +data.info.holder_sex) {
                holder_sex = tem.value
            }
        })

        // type
        // 1. 填写项
        // 2. 下拉列表
        // 3. 生日
        // 4. 级联选择
        // 5. 添加 action
        // 6. 试算 trial

        // 编辑字段名
        return {
            zjx: [
                {
                    key: 'relation',
                    label: '为谁投保',
                    value: data.info && data.info.relation || '',
                    type: 2,
                    items: relation,
                    isrequired: 1
                },
                {
                    key: 'realName',
                    label: '被保人姓名',
                    value: data.info && data.info.realName || '',
                    type: 1,
                    unit: '',
                    isrequired: 1
                },
                {
                    key: 'sex',
                    label: '性别',
                    value: data.info && data.info.sexName || '',
                    type: 2,
                    items: data.insure.scope.sex,
                    isrequired: 1
                },
                {
                    key: 'birthday',
                    label: '出生日期',
                    value: data.info && data.info.birthday || '',
                    type: 3,
                    min: data.insure.scope.birthday.min,
                    max: data.insure.scope.birthday.max,
                    isrequired: 1
                },
                {
                    key: 'region',
                    label: '常住地',
                    value: data.info && data.info.region || '',
                    keys: data.info && data.info.region || '',
                    type: 4,
                    items: prov,
                    isrequired: 1
                },
                {
                    key: 'socialsecurity',
                    label: '社保种类',
                    value: social,
                    type: 2,
                    items: data.insure.scope.social,
                    isrequired: 0
                },
                {
                    key: 'insurance',
                    label: '商业保险',
                    value: insurance,
                    type: 2,
                    items: data.insure.scope.socials,
                    isrequired: 0
                },
                {
                    key: 'coverstr',
                    label: '保障期限',
                    value: data.info && data.info.coverstr && data.info.coverstr.value || '',
                    type: 2,
                    items: data.pcfilters.coverstr,
                    isrequired: 0
                },
                {
                    key: 'planning',
                    label: '保额规划',
                    value: data.info && data.info.planning || '',
                    type: 1,
                    unit: '万元',
                    isrequired: 0
                },
                {
                    key: 'huomian',
                    label: '投保豁免',
                    value: data.info && (data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value) || '',
                    hidden: data.info && data.info.relation === '自己' || false,
                    type: 2,
                    items: data.pcfilters.holderfee,
                    isrequired: 0
                },
                {
                    key: 'zholder_birthday',
                    label: '投保人出生日期',
                    hidden: data.info && (data.info.relation === '自己' || (data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value === '不包含')) || false,
                    type: 3,
                    min: data.holder.scope.birthday.min,
                    max: data.holder.scope.birthday.max,
                    value: data.info && data.info.zholder_birthday || '',
                    isrequired: 0
                },
                {
                    key: 'zholder_sex',
                    label: '投保人性别',
                    hidden: data.info
                            && (data.info.relation === '自己' || (data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value === '不包含')) || false,
                    value: zholder_sex,
                    type: 2,
                    items: data.holder.scope.sex,
                    isrequired: 0
                },
                {
                    key: 'mildnum',
                    label: '轻症保障程度',
                    value: data.info && data.info.mildnum && data.info.mildnum.value || '',
                    type: 2,
                    items: data.pcfilters.mildnum,
                    isrequired: 0
                },
                {
                    key: 'servernum',
                    label: '重症保障程度',
                    value: data.info && data.info.servernum && data.info.servernum.value || '',
                    type: 2,
                    items: data.pcfilters.servernum,
                    isrequired: 0
                },
                {
                    key: 'qdie',
                    label: '身故责任',
                    value: data.info && data.info.qdie && data.info.qdie.value || '',
                    type: 2,
                    items: data.pcfilters.qdie,
                    isrequired: 0
                },
                {
                    key: 'fo_medical',
                    label: '关注疾病',
                    value: '',
                    type: 5,
                    isrequired: 0
                },
                {
                    key: 'divide',
                    label: '分割线',
                    value: '',
                    type: 7,
                    isrequired: 0
                }
            ],
            fax: [
                {
                    key: 'relation',
                    label: '为谁投保',
                    value: data.info && data.info.relation || '',
                    type: 2,
                    items: relation,
                    isrequired: 1
                },
                {
                    key: 'realName',
                    label: '被保人姓名',
                    value: data.info && data.info.realName || '',
                    type: 1,
                    unit: '',
                    isrequired: 1
                },
                {
                    key: 'sex',
                    label: '性别',
                    value: data.info && data.info.sexName || '',
                    type: 2,
                    items: data.insure.scope.sex,
                    isrequired: 1
                },
                {
                    key: 'birthday',
                    label: '出生日期',
                    value: data.info && data.info.birthday || '',
                    type: 3,
                    min: data.insure.scope.birthday.min,
                    max: data.insure.scope.birthday.max,
                    isrequired: 1
                },
                {
                    key: 'region',
                    label: '常住地',
                    value: data.info && data.info.region || '',
                    keys: data.info && data.info.region || '',
                    type: 4,
                    items: prov,
                    isrequired: 1
                },
                {
                    key: 'socialsecurity',
                    label: '社保种类',
                    value: social,
                    type: 2,
                    items: data.insure.scope.social,
                    isrequired: 0
                },
                {
                    key: 'insurance',
                    label: '商业保险',
                    value: insurance,
                    type: 2,
                    items: data.insure.scope.socials,
                    isrequired: 0
                },
                {
                    key: 'coverstr',
                    label: '保障期限',
                    value:  data.info && data.info.coverstr && data.info.coverstr.value || '',
                    type: 2,
                    items: data.pcfilters.coverstr,
                    isrequired: 0
                },
                {
                    key: 'planning',
                    label: '保额规划',
                    value: data.info && data.info.planning || '',
                    type: 1,
                    unit: '万元',
                    isrequired: 0
                },
                {
                    key: 'huomian',
                    label: '投保豁免',
                    value: data.info && data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value || '',
                    hidden: data.info && data.info.relation === '自己' || false,
                    type: 2,
                    items: data.pcfilters.holderfee,
                    isrequired: 0
                },
                {
                    key: 'zholder_birthday',
                    label: '投保人出生日期',
                    hidden: data.info && (data.info.relation === '自己' || (data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value === '不包含')) || false,
                    type: 3,
                    min: data.holder.scope.birthday.min,
                    max: data.holder.scope.birthday.max,
                    value: data.info && data.info.zholder_birthday || '',
                    isrequired: 0
                },
                {
                    key: 'zholder_sex',
                    label: '投保人性别',
                    hidden: data.info && (data.info.relation === '自己' || (data.info.huomian && data.info.huomian[0] && data.info.huomian[0].value === '不包含')) || false,
                    value: zholder_sex,
                    type: 2,
                    items: data.holder.scope.sex,
                    isrequired: 0
                },
                {
                    key: 'mildnum',
                    label: '轻症保障程度',
                    value: data.info && data.info.mildnum && data.info.mildnum.value || '',
                    type: 2,
                    items: data.pcfilters.mildnum,
                    isrequired: 0
                },
                {
                    key: 'servernum',
                    label: '重症保障程度',
                    value: data.info && data.info.servernum && data.info.servernum.value || '',
                    type: 2,
                    items: data.pcfilters.servernum,
                    isrequired: 0
                },
                {
                    key: 'qdie',
                    label: '身故责任',
                    value: data.info && data.info.qdie && data.info.qdie.value || '',
                    type: 2,
                    items: data.pcfilters.qdie,
                    isrequired: 0
                },
                {
                    key: 'fo_medical',
                    label: '关注疾病',
                    value: '',
                    type: 5,
                    isrequired: 0
                },
                {
                    key: 'divide',
                    label: '分割线',
                    value: '',
                    type: 7,
                    isrequired: 0
                }
            ],
            ylx: [
                {
                    key: 'relation',
                    label: '为谁投保',
                    value: data.info && data.info.relation || '',
                    type: 2,
                    items: relation,
                    isrequired: 1
                },
                {
                    key: 'realName',
                    label: '被保人姓名',
                    value: data.info && data.info.realName || '',
                    type: 1,
                    unit: '',
                    isrequired: 1
                },
                {
                    key: 'sex',
                    label: '性别',
                    value: data.info && data.info.sexName || '',
                    type: 2,
                    items: data.insure.scope.sex,
                    isrequired: 1
                },
                {
                    key: 'birthday',
                    label: '出生日期',
                    value: data.info && data.info.birthday || '',
                    type: 3,
                    min: data.insure.scope.birthday.min,
                    max: data.insure.scope.birthday.max,
                    isrequired: 1
                },
                {
                    key: 'region',
                    label: '常住地',
                    value: data.info && data.info.region || '',
                    keys: data.info && data.info.region || '',
                    type: 4,
                    items: prov,
                    isrequired: 1
                },
                {
                    key: 'psparatio5',
                    label: '就诊医院',
                    value: data.info && data.info.psparatio5 && data.info.psparatio5.value || '',
                    type: 2,
                    items: data.pcfilters.psparatio5,
                    isrequired: 0
                },
                {
                    key: 'socialsecurity',
                    label: '社保种类',
                    value: social,
                    type: 2,
                    items: data.insure.scope.social,
                    isrequired: 0
                },
                {
                    key: 'obtduty',
                    label: '附加责任',
                    value: data.info && data.info.obtduty && data.info.obtduty.value || '',
                    type: 2,
                    items: data.pcfilters.obtduty,
                    isrequired: 0
                },
                {
                    key: 'yearfee',
                    label: '年预算保费',
                    value: data.info && data.info.yearfee || '',
                    type: 1,
                    unit: '万元',
                    isrequired: 0
                }
            ],
            gyl: [
                {
                    key: 'relation',
                    label: '为谁投保',
                    value: data.info && data.info.relation || '',
                    type: 2,
                    items: relation,
                    isrequired: 1
                },
                {
                    key: 'realName',
                    label: '被保人姓名',
                    value: data.info && data.info.realName || '',
                    type: 1,
                    unit: '',
                    isrequired: 1
                },
                {
                    key: 'sex',
                    label: '性别',
                    value: data.info && data.info.sexName || '',
                    type: 2,
                    items: data.insure.scope.sex,
                    isrequired: 1
                },
                {
                    key: 'birthday',
                    label: '出生日期',
                    value: data.info && data.info.birthday || '',
                    type: 3,
                    min: data.insure.scope.birthday.min,
                    max: data.insure.scope.birthday.max,
                    isrequired: 1
                },
                {
                    key: 'holder_birthday',
                    label: '投保人出生日期',
                    hidden: data.info && moment() > moment(data.info.birthday).add(18, 'year') || false,
                    type: 3,
                    min: data.holder.scope.birthday.min,
                    max: data.holder.scope.birthday.max,
                    value: data.info && data.info.holder_birthday || '',
                    isrequired: 0
                },
                {
                    key: 'holder_sex',
                    label: '投保人性别',
                    hidden: data.info && moment() > moment(data.info.birthday).add(18, 'year') || false,
                    value: data.info && data.info.holder_sex || '',
                    type: 2,
                    items: data.holder.scope.sex,
                    isrequired: 0
                },
                {
                    key: 'region',
                    label: '常住地',
                    value: data.info && data.info.region || '',
                    keys: data.info && data.info.region || '',
                    type: 4,
                    items: prov,
                    isrequired: 1
                },
                {
                    key: 'yearfee',
                    label: '年保费预算',
                    value: data.info && data.info.yearfee || '',
                    type: 1,
                    unit: '万元',
                    isrequired: 0
                },
                {
                    key: 'hospital',
                    label: '常用医院',
                    value: data.info && data.info.hospital.text || '',
                    type: 1,
                    isrequired: 0
                },
                {
                    key: 'psparatio6',
                    label: '就诊医院',
                    value: data.info && data.info.psparatio6 && data.info.psparatio6.value || '',
                    type: 2,
                    items: data.pcfilters.psparatio6,
                    isrequired: 0
                },
                {
                    key: 'obtduty',
                    label: '附加责任',
                    value: data.info && data.info.obtduty && data.info.obtduty.value || '',
                    type: 2,
                    items: data.pcfilters.obtduty,
                    isrequired: 0
                },
                {
                    key: 'areatag2',
                    label: '覆盖地域',
                    value: data.info && data.info.areatag2 && data.info.areatag2.value || '',
                    type: 2,
                    items: data.pcfilters.areatag2,
                    isrequired: 0
                }
            ],
            ywx: [
                {
                    key: 'relation',
                    label: '为谁投保',
                    value: data.info && data.info.relation || '',
                    type: 2,
                    items: relation,
                    isrequired: 1
                },
                {
                    key: 'realName',
                    label: '被保人姓名',
                    value: data.info && data.info.realName || '',
                    type: 1,
                    unit: '',
                    isrequired: 1
                },
                {
                    key: 'sex',
                    label: '性别',
                    value: data.info && data.info.sexName || '',
                    type: 2,
                    items: data.insure.scope.sex,
                    isrequired: 1
                },
                {
                    key: 'birthday',
                    label: '出生日期',
                    value: data.info && data.info.birthday || '',
                    type: 3,
                    min: data.insure.scope.birthday.min,
                    max: data.insure.scope.birthday.max,
                    isrequired: 1
                },
                {
                    key: 'accicover',
                    label: '保险期间',
                    value: data.info && data.info.accicover && data.info.accicover.value || '',
                    type: 2,
                    items: data.pcfilters.accicover,
                    isrequired: 0
                },
                {
                    key: 'acciamount',
                    label: '预期保额',
                    value: data.info && data.info.acciamount && data.info.acciamount.value || '',
                    type: 2,
                    items: data.pcfilters.acciamount,
                    isrequired: 0
                },
                {
                    key: 'accident',
                    label: '保险类型',
                    value: accidentValue,
                    keys: accidentKey,
                    type: 4,
                    items: accident,
                    isrequired: 0
                },
                {
                    key: 'acciobtduty',
                    label: '附加责任',
                    value: data.info && data.info.acciobtduty && data.info.acciobtduty.value || '',
                    type: 2,
                    items: data.pcfilters.obtduty,
                    isrequired: 0
                }
            ],
            items: data.items,
            fo_medical: data.info && data.info.fo_medical || '',
            amount: data.info && data.info.amount || '',
            amount_min: data.info && data.info.amount_min || '',
            amount_max: data.info && data.info.amount_max || '',
            fee: data.info && data.info.fee || '',
            fee_min: data.info && data.info.fee_min || '',
            fee_max: data.info && data.info.fee_max || '',
        }
    }
    catch (err) {
        reporter({
            name: err.name,
            stack: err.stack,
            message: err.message
        })
    }
}

export function deepCloneArr(arr) {
    let ret = []

    try {
        arr.forEach(item => {
            let obj = {}

            for (let key in item) {
                if (Object.prototype.toString.call(item[key]) === '[object Array]') {
                    obj[key] = deepCloneArr(item[key])
                }
                else {
                    obj[key] = item[key]
                }
            }

            ret.push(obj)
        })
    }
    catch (err) {
        reporter({errMsg: err})
        console.log('克隆险种数组数据出错: ', err)
    }

    return ret
}
