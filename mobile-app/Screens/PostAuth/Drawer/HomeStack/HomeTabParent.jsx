import * as React from 'react';
import { View, BackHandler, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeTab from './HomeTabs/HomeTab';
import CommTabParent from './HomeTabs/CommTabParent';
import CheerTab from './HomeTabs/CheerTab';

const Tab = createBottomTabNavigator();

export default ({navigation}) => {

    return(
        <Tab.Navigator initialRouteName="HomeTab">
            <Tab.Screen 
                name="HomeTab" 
                component={HomeTab} 
                options={{
                    title: 'Home',
                    tabBarIcon: ({color}) => <IconButton icon='home' color={color}/>
                }}/>
            <Tab.Screen 
                name="Communities" 
                component={CommTabParent}
                options={{
                    tabBarIcon: ({color}) => <IconButton icon='account-group' color={color}/>
                }}
            />
            <Tab.Screen 
                name="Cheer Squad" 
                component={CheerTab}
                options={{
                    tabBarIcon: ({color}) => <IconButton icon='fire' color={color}/>
                }}
            />
        </Tab.Navigator>
    )
}