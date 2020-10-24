import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AuthTabNavigator from './AuthTabNavigator'
import UserDrawerNavigator from './UserDrawerNavigator'
import { getItemAsync } from 'expo-secure-store'
import { View, ActivityIndicator } from 'react-native'

const Stack = createStackNavigator()

export default () => {

    const [iRN, setIRN] = React.useState("")

    React.useEffect(() => {
        getItemAsync('token')
        .then(token => setIRN(token ? "Drawer" : "Auth"))
        .catch(err => {
            alert(err.message)
            setIRN("Auth")
        })
    },[])

    return(
        iRN.length ?
        <Stack.Navigator headerMode="none" initialRouteName={iRN}>
            <Stack.Screen name="Auth" component={ AuthTabNavigator }/>
            <Stack.Screen name="Drawer" component={ UserDrawerNavigator }/>
        </Stack.Navigator> 
        :
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}