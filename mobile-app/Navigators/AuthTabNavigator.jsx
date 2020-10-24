import * as React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import { useTheme } from '@react-navigation/native'
import * as Device from 'expo-device'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native'
import Login from '../Screens/Auth/Login'
import Forgot from '../Screens/Auth/Forgot'
import Register from '../Screens/Auth/Register'

const Tab = createMaterialTopTabNavigator()
const isIphoneX = Device.modelName.includes('iPhone X')

const TabDetails = [
    {
        name: "Forgot",
        component: Forgot,
        iconName: 'lock-reset'
    },
    {
        name: "Login",
        component: Login,
        iconName: 'fingerprint'
    },
    {
        name: "Register",
        component: Register,
        iconName: 'pencil'
    }
]

export default () => {

    const theme = useTheme()

    return(
        <Tab.Navigator 
            initialRouteName="Login"
            tabBarPosition="bottom"
            tabBarOptions={{
                showIcon: true,
                style: {
                    backgroundColor: theme.colors.background,
                    paddingBottom: isIphoneX ? 34 : 0
                }
            }}
        >
        {
            TabDetails.map((item, index) =>
                <Tab.Screen
                    key={index}
                    name={item.name}
                    component={item.component}
                    options={{
                        tabBarIcon: ({color}) =>
                        <MaterialCommunityIcons
                            name={item.iconName}
                            color={color}
                            style={styles.icon}
                            size={24}
                        />
                    }}
                />
            )
        }
        </Tab.Navigator>
    )
}

const styles = StyleSheet.create({
    icon: {
        alignSelf: 'center'
    }
})