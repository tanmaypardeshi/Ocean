import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import Feed from './Feed/VFeed'
import Communities from './Communities/Communities'
import CheerSquad from './CheerSquad/CheerSquad'
import Single from './Feed/VSingle'
import Profile from './Profile/Profile'
import SingleCheer from './CheerSquad/SingleCheer'

// eslint-disable-next-line import/no-anonymous-default-export
export default () => 
    <Switch>
        <Route path='/home/feed/:id' component={Single}/>
        <Route exact path='/home/feed' component={Feed}/>
        <Route path='/home/profile' component={Profile}/>
        <Route path='/home/communities/:tag' component={Communities}/>
        <Route path='/home/cheer' component={CheerSquad}/>
        <Redirect from='/home' to='/home/feed'/>                                                                                                                                                                                                                                                                                                                                                                          
    </Switch>