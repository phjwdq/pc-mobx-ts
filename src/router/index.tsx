/**
 * @file router
 * @author luwenlong
 */

import React from 'react'
import Loadable from 'react-loadable'
import {BrowserRouter as Router, Switch, Route, Redirect} from 'react-router-dom'
import {hot} from 'react-hot-loader'

import PageLoading from '@components/PageLoading'
import Error from '@components/Error'

const Login = Loadable({
    loader: () => import(/* webpackChunkName: "login" */ '@views/Login'),
    loading: PageLoading
})


// 权限控制
const PrivateRoute = ({component: Component, ...rest}) => (
    <Route path='/im' {...rest} render={props => (
        window.kuid && window.kuname
        ? <Component {...props}/>
        : <Redirect to={{
            pathname: '/login',
            state: {from: props.location}
          }} />
    )} />
)

const AppRouter = () => (
    <Router basename='/im'>
        <Switch>
            <Route exact path="/" component={Login} />
            <Route component={Error} />
        </Switch>
    </Router>
)

export default hot(module)(AppRouter)
