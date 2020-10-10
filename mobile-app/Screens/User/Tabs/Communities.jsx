import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import * as SecureStore from 'expo-secure-store'
import { FlatList, View, RefreshControl } from 'react-native'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { ActivityIndicator, List, IconButton } from 'react-native-paper'
import NewPost from './NewPost'
import Community from './Community'

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

    //const isVisible = useIsFocused()
    const [refreshing, setRefreshing] = React.useState(false)
    const [myComms, setMyComms] = React.useState([])

    useFocusEffect(React.useCallback(() => {
        if (!myComms.length) {
            getMyComms()
        }
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
            const tags = res.data.data.tags
            let comms = Object.getOwnPropertyNames(tags).filter((name) => tags[name]).map((name) => ({name, status: true}))
            comms.push(Object.getOwnPropertyNames(tags).filter((name) => !tags[name]).map((name) => ({name, status: false})))
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
                    onPress={() => navigation.navigate('Community', { name: item.name.split('_').join(' ')})}
                    right={props => item.status && <IconButton {...props} icon='bell'/>}
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
                options={({ route }) => ({ 
                    title: route.params.name,
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/> 
                })}
            />
            <Stack.Screen
                name="New Post"
                component={NewPost}
            />
        </Stack.Navigator>
    )
}