import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, TouchableRipple, ActivityIndicator } from 'react-native-paper'

const Stack = createStackNavigator()

const Likes = ({ navigation }) => {
    const [likes, setLikes] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused && likes.length === 0)
            getLikes()
    },[isFocused])

    const getLikes = () => {
        SecureStore.getItemAsync('token')
        .then(token =>
            Axios.get(
                `${SERVER_URI}/post/mylikes/`,
                {
                    headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`}
                }
            )    
        )
        .then(res => {
            setLikes(res.data.like_list)
        })
        .catch(err => {
            alert(err.message)
        })
        .finally(() => {
            setLoading(false)
            setRefreshing(false)
        })
    }

    const handleRefresh = () => {
        setRefreshing(true)
        getLikes()
    }

    return(
        !loading ?
        <FlatList
            data={likes}
            extraData={likes}
            keyExtractor={(item, index) => item.post_id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={({ item, index }) => 
                <TouchableRipple
                    key={index}
                    onPress={() => navigation.navigate('Post', {item})}
                >
                    <Card.Title
                        key={index}
                        title={item.post_title}
                        subtitle={item.author}
                        left={props => <Avatar.Text {...props} label={item.author.split(" ").map(str => str[0]).join("")}/>}
                        right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                </TouchableRipple>
            }
        />
        :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}

export default ({ navigation }) => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='My Likes'
                component={Likes}
            />
        </Stack.Navigator>
    )
}