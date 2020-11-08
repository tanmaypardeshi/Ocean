import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import * as SecureStore from 'expo-secure-store'
import { FlatList, View, RefreshControl, Alert } from 'react-native'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { ActivityIndicator, List, IconButton } from 'react-native-paper'
import NewPost from './NewPost'
import Community from './Community'
import Post from './Post'

const list = {
    Productivity: false,
    Self_Help: false,
    Self_Improvement : false,
    Personal_Development: false,
    Spirituality: false,
    Motivation: false,
    Positivity: false,
    Career: false,
    Discipline: false,
    Relationships:false,
    Success: false,
    Depression: false,
    Anxiety: false,
    PTSD: false,
    Alcohol: false,
    Internet_Addiction: false,
    Bipolar_Disorder: false,
    Social_Anxiety_Disorder: false,
    Stress: false,
    Sleep_Disorder: false,
    Empathy_Deficit_Disorder:false 
}

const Communites = ({ navigation }) => {

    const [refreshing, setRefreshing] = React.useState(false)
    const [myComms, setMyComms] = React.useState([])
    const [profile, setProfile] = React.useState()

    useFocusEffect(React.useCallback(() => {
        getMyComms()
    },[]))
    
    const getMyComms = () => 
        SecureStore.getItemAsync("token")
        .then(token => 
            Axios.get(
                `${SERVER_URI}/user/profile/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setProfile(res.data.data)
            let tlist = {...list};
            Object
            .getOwnPropertyNames(tlist)
            .filter(name => res.data.data.tags.includes(name.toLowerCase()))
            .forEach(name => tlist[name] = true);

            let comms = Object.getOwnPropertyNames(tlist).filter(name => tlist[name]).map(name => ({name, status: true}))
            comms.push(Object.getOwnPropertyNames(tlist).filter(name => !tlist[name]).map(name => ({name, status: false})))
            setMyComms(comms.flat())
            setRefreshing(false)
            
        })
        .catch(err => alert(err.message))

    const handleRefresh = () => {
        setRefreshing(true)
        getMyComms()
    }

    return(
        myComms.length
        ?
        <FlatList
            data={myComms}
            extraData={myComms}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            keyExtractor={(item, index)=>index.toString()}
            renderItem={({item, index}) =>
                <List.Item
                    key={index}
                    title={item.name.split('_').join(' ')}
                    onPress={() => navigation.navigate('Community', { 
                        name: item.name.split('_').join(' '),
                        status: item.status,
                        profile
                    })}
                    right={props => item.status && <IconButton {...props} icon='account-multiple-check'/>}
                />
            }
        /> 
        :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}

const Stack = createStackNavigator();

export default ({navigation}) => {

    const updateProfile = (profile, community, action) =>  
        SecureStore.getItemAsync("token")
        .then(token => {
            let newProfile = {...profile}
            if (action) {
                newProfile.tags = newProfile.tags.filter(val => val !== community)
            }
            else {
                const tgs = newProfile.tags
                tgs.push(community)
                newProfile.tags = tgs
            }
            newProfile.tags = newProfile.tags.join(' ')
            console.log(newProfile)
            return Axios.patch(
                `${SERVER_URI}/user/profile/`,
                newProfile,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .catch(err => alert(err.message))
    

    return(
        <Stack.Navigator initialRouteName="All Communities">
            <Stack.Screen
                name="All Communities"
                component={Communites}
                options={{
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
            />
            <Stack.Screen
                name="Community"
                component={Community}
                options={({ route, navigation }) => ({ 
                    title: route.params.name,
                    headerRight: () => <IconButton 
                        icon={route.params.status ? 'account-remove' : 'account-multiple-plus'}
                        onPress={() => {
                            updateProfile(
                                route.params.profile, 
                                route.params.name.toLowerCase().split(' ').join('_'),
                                route.params.status
                            )
                            .then(() => navigation.setParams({...route.params, status: !route.params.status}))
                            .catch(err => alert(err.message))
                        }} 
                    />
                })}
            />
            <Stack.Screen
                name="New Post"
                component={NewPost}
            />
            <Stack.Screen
                name="Post"
                component={Post}
            />
        </Stack.Navigator>
    )
}