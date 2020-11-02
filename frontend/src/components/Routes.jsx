import React from 'react';
import {BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './user/login';
import Register from './user/register';
import Forgot from './user/forgot';
import Landing from './PostAuth/Landing';


export default function Routes() {
    return(
        <BrowserRouter>
            <Switch>
                <Route exact path='/' component={Login}/>
                <Route path='/register' component={Register}/>
                <Route path='/forgot' component={Forgot}/>
                <Route path='/home' component={Landing}/>
            </Switch>
        </BrowserRouter>
    )
}