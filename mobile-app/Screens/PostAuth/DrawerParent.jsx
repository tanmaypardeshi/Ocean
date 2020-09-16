import * as React from 'react'
import { Button, ActivityIndicator, Avatar, Headline, Text, Caption, IconButton, Colors } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store';
import { View } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import HomeStackParent from './Drawer/HomeStackParent';
import Profile from './Drawer/Profile';
import Axios from 'axios';

const Drawer = createDrawerNavigator();

export default ({route, navigation}) => {

    const [childTheme, setChildTheme] = React.useState(route.params.dark)
    const [userDetails, setUserDetails] = React.useState(null);

    React.useEffect(() => {
        SecureStore.getItemAsync("token")
        .then(token => {
            Axios.get("http://192.168.29.126:8000/api/profile/", {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type" : "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => {console.log(res.data.data); setUserDetails(res.data.data)})
            .catch(err => alert(err.message))
        })
        .catch(console.log)
    },[]);

    const handleLogOut = navigation => event => {
        SecureStore.deleteItemAsync('token')
        .then(() => navigation.navigate("Login"))
        .catch(console.log);
    }

    const CustomDrawerContent = (props) => (
        <DrawerContentScrollView {...props}>
            <View
                style={{
                    height: 250,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
            {
                userDetails 
                ?
                <>
                <Avatar.Text 
                    size={64} 
                    label={userDetails.user.first_name.slice(0, 1) + userDetails.user.last_name.slice(0, 1)}
                /> 
                    <Headline style={{marginTop: 15}}>
                    {userDetails.user.first_name + " " + userDetails.user.last_name}
                    </Headline>
                    <Caption>
                    {userDetails.user.gender + " | " + userDetails.user.age}
                    </Caption>
                    <Caption>
                    {userDetails.user.country}
                    </Caption>
                </>
                :
                <ActivityIndicator animating={true}/>
            }
            </View>
            <DrawerItemList {...props}/>
            <DrawerItem
                label='Toggle Theme'
                onPress={() => {
                    route.params.setDark(!childTheme);
                    setChildTheme(!childTheme);
                }}
                icon={({color}) => <IconButton icon={childTheme ? 'brightness-7' : 'brightness-4'} color={color}/>}
            />
            <DrawerItem
                label='Logout'
                onPress={handleLogOut(props.navigation)}
                icon={({color}) => <IconButton icon='logout' color={color}/>}
            />
        </DrawerContentScrollView>
    )

    return(
            <Drawer.Navigator 
                initialRouteName="HomeStackParent"
                drawerContent={props => <CustomDrawerContent {...props} />}
            >
                <Drawer.Screen 
                    name="HomeStackParent" 
                    component={HomeStackParent} 
                    options={{
                        title: 'Home',
                        drawerIcon: ({color}) => 
                            <IconButton icon='home' color={color}/>
                    }}
                />
                <Drawer.Screen 
                    name="Profile" 
                    component={Profile}
                    options={{
                        drawerIcon: ({color}) => 
                        <IconButton icon='account' color={color}/>
                    }}
                />
            </Drawer.Navigator>
    )
}