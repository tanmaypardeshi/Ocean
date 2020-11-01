import React from 'react';
import {BrowserRouter, Switch, Route } from 'react-router-dom';
import Login from './user/login';
import Register from './user/register';

export default function Routes() {
    return(
        <BrowserRouter>
            <Switch>
                <Route exact path='/' component={Login}/>
                <Route path='/register' component={Register}/>
            </Switch>
        </BrowserRouter>
    )
}