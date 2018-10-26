/**
 * @file reactExt
 * @author luwenlong
 */

import api from './api'
import {Message} from 'antd'

/**
 * 扩展store类
 */
export class StoreExt {
    readonly api = api
    readonly $message = Message
}
