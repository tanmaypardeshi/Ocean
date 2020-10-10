import * as React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import * as Device from 'expo-device'
import { useTheme } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { StyleSheet } from 'react-native';
import Feed from '../Screens/User/Tabs/Feed'
import Communities from '../Screens/User/Tabs/Communities'
import Cheer from '../Screens/User/Tabs/Cheer'
import Coral from '../Screens/User/Tabs/Coral'

const Tab = createMaterialTopTabNavigator();
const isIphoneX = Device.modelName.includes('iPhone X')

const TabDetails = [
    {
        name: "Feed",
        component: Feed,
        iconName: 'newspaper'
    },
    {
        name: "Communities",
        component: Communities,
        iconName: 'account-group'
    },
    {
        name: "Cheer Squad",
        component: Cheer,
        iconName: 'fire'
    },
    {
        name: "Coral",
        component: Coral,
        iconName: 'robot'
    }
]

export default ({ navigation }) => {

    const theme = useTheme()

    return(
        <Tab.Navigator 
            initialRouteName="Feed"
            tabBarPosition='bottom'
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
                        tabBarOptions: ({color}) =>
                        <MaterialCommunityIcons
                            name={item.iconName}
                            color={color}
                            style={styles.icon}
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
        marginTop: -3,
        alignSelf: 'center'
    }
})