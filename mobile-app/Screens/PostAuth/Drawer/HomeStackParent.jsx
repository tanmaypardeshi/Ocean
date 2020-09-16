import * as React from 'react'
import { Button, IconButton, Searchbar } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store';
import { Alert, BackHandler, View } from 'react-native';
import { useFocusEffect, StackActions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeTabParent from './HomeStack/HomeTabParent';
import Chat from './HomeStack/Chat';

const Stack = createStackNavigator();

export default ({navigation}) => {

    return(
        <Stack.Navigator initialRouteName="HomeTabParent">
            <Stack.Screen
                name="HomeTabParent"
                component={HomeTabParent}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name='Chat'
                component={Chat}
            />
        </Stack.Navigator>
    )
}