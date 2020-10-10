import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AuthTabNavigator from './AuthTabNavigator'
import UserDrawerNavigator from './UserDrawerNavigator'

const Stack = createStackNavigator()

export default () => {
    return(
       <Stack.Navigator headerMode="none" initialRouteName="Auth">
           <Stack.Screen name="Auth" component={ AuthTabNavigator }/>
           <Stack.Screen name="Drawer" component={ UserDrawerNavigator }/>
       </Stack.Navigator> 
    )
}