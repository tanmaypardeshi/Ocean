import * as React from 'react'
import { 
    createDrawerNavigator, 
    DrawerContentScrollView, 
    DrawerItem, 
    DrawerItemList, 
    useIsDrawerOpen 
} from '@react-navigation/drawer'
import * as SecureStore from 'expo-secure-store'
import { useFocusEffect } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../Constants/Network'
import { View, StyleSheet, Alert, BackHandler } from 'react-native'
import { ActivityIndicator, Avatar, Headline, Caption, ToggleButton, TouchableRipple } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import UserTabNavigator from './UserTabNavigator'
import Profile from '../Screens/User/Drawer/Profile'
import Posts from '../Screens/User/Drawer/Posts'
import Likes from '../Screens/User/Drawer/Likes'
import Comments from '../Screens/User/Drawer/Comments'
import Goals from '../Screens/User/Drawer/Goals'

const DCS = (props) => {
    const [profile, setProfile] = React.useState({})
    const [loading, setLoading] = React.useState(true)
    const isDrawerOpen = useIsDrawerOpen()

    useFocusEffect(React.useCallback(() => {
        if (isDrawerOpen)
            getProfileData()
    },[isDrawerOpen]))

    const getProfileData = () => {
        SecureStore.getItemAsync('token')
        .then(token => {
            return Axios.get(
                `${SERVER_URI}/user/profile/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => setProfile(res.data.data))
        .then(() => setLoading(false))
        .catch(err => {
            setLoading(false)
            alert(err.message)
        })
    }

    const handleLogOut = () => {
        SecureStore.deleteItemAsync('token')
        .then(() => props.navigation.navigate("Auth"))
        .catch(console.log)
    }

    return(
        <DrawerContentScrollView {...props}>
            <View style={styles.dcsv}>
            {
                !loading ?
                <>
                    <Avatar.Text
                        size={64}
                        label={profile.first_name[0] + profile.last_name[0]}
                    />
                    <Headline style={styles.headLine}>
                        {profile.first_name + " " + profile.last_name}
                    </Headline>
                    <Caption>
                        {profile.gender + " | " + profile.age}
                    </Caption>
                    <Caption>
                        {profile.country}
                    </Caption>
                </>
                :
                <TouchableRipple onPress={getProfileData}>
                    <ActivityIndicator animating={true}/>
                </TouchableRipple>
            }
            </View>
            <DrawerItemList {...props}/>
            <DrawerItem
                label='Logout'
                onPress={handleLogOut}
                icon={({color}) => <MaterialCommunityIcons name='logout' color={color} size={18}/>}
            />
        </DrawerContentScrollView>
    )
}

const Drawer = createDrawerNavigator()

const DrawerItems = [
    {
        name: "Home",
        component: UserTabNavigator,
        iconName: 'home'
    },
    {
        name: "Profile",
        component: Profile,
        iconName: 'account'
    },
    {
        name: "Posts",
        component: Posts,
        iconName: 'file-document-box-multiple'
    },
    {
        name: "Likes",
        component: Likes,
        iconName: 'inbox-arrow-up'
    },
    {
        name: "Comments",
        component: Comments,
        iconName: 'comment-multiple'
    },
    {
        name: "Goals",
        component: Goals,
        iconName: 'format-list-numbered'
    }
]

export default ({ navigation }) => {

    return(
        <Drawer.Navigator initialRouteName="Home" drawerContent={props => <DCS {...props}/>}>
        {
            DrawerItems.map((item, index) =>
                <Drawer.Screen
                    key={index}
                    name={item.name}
                    component={item.component}
                    options={{
                        drawerIcon: ({color}) => 
                        <MaterialCommunityIcons 
                            name={item.iconName} 
                            color={color}
                            size={18}
                        />
                    }}
                />
            )
        }
        </Drawer.Navigator>
    )
}

const styles = StyleSheet.create({
    dcsv: {
        height: 250,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headLine: { marginTop: 15 }
})