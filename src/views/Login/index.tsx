/**
* @file Login
* @author luwenlong
*/

import React, {Component} from 'react'
import {inject, observer} from 'mobx-react'
import {Input, Button} from 'antd'
import styles from './index.less'

const nameErrMsgCont = '请填写用户名'
const pwdErrMsgCont = '请填写密码'

interface Props {
    kfStore?: Store.KfStore
}

@observer
class Login extends Component {
    constructor(props: Props) {
        super(props)
    }

    componentDidMount() {
        // if (window.kuid) {
        //     //window.location.href = '/im'

        //     return false
        // }
    }

    render () {
        return (
            <div>
                login login login login
            </div>
        )
    }
}

export default inject('kfStore')(Login)
