import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, TouchableRipple, ActivityIndicator, Caption } from 'react-native-paper'
import Post from '../Tabs/Post'

const Stack = createStackNavigator()

const Likes = ({ navigation }) => {
    const [likes, setLikes] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused && likes.length === 0)
            getLikes(page, likes)
    },[isFocused])

    const getLikes = (pageno, oldLikes) => {
        SecureStore.getItemAsync('token')
        .then(token =>
            Axios.get(
                `${SERVER_URI}/post/mylikes/${pageno}`,
                {
                    headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`}
                }
            )    
        )
        .then(res => {
            setLikes([...oldLikes, ...res.data.like_list])
            if (res.data.like_list.length < 10 || !res.data.success)
                setEnd(true)
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
        setEnd(false)
        setRefreshing(true)
        setPage(1)
        getLikes(1, [])
    }

    const handleEnd = () => {
        console.log("Fetching likes")
        if (!end && !loading) {
            getLikes(page + 1, likes)
            setPage(page + 1)
        }
    }

    return(
        <FlatList
            data={likes}
            extraData={likes}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
            ListFooterComponent={
                !loading && 
                // <Card.Title style={{justifyContent: 'center', alignItems: 'center', marginVertical: 10, paddingVertical: 10}}>
                //     {
                //         end 
                //         ?
                //         <Caption>Welcome to the bottom of Ocean :)</Caption>
                //         :
                //         <Caption>Fetching more content for you...</Caption>
                //     }
                // </Card.Title>
                <Card.Title
                    subtitle={end ? 'Welcome to the bottom of Ocean :)' : 'Fetching more content for you...'}
                />
            }
            renderItem={({ item, index }) => 
                <TouchableRipple
                    key={index}
                    onPress={() => navigation.navigate('Post', {item: {...item, post_id: item.id}})}
                >
                    <Card.Title
                        key={index}
                        title={item.author}
                        subtitle={item.post_title}
                        subtitleNumberOfLines={3}
                        left={props => <Avatar.Text {...props} label={item.author.split(" ").map(str => str[0]).join("")}/>}
                    />
                </TouchableRipple>
            }
        />
    )
}

export default ({ navigation }) => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='My Likes'
                component={Likes}
            />
            <Stack.Screen
                name='Post'
                component={Post}
            />
        </Stack.Navigator>
    )
}