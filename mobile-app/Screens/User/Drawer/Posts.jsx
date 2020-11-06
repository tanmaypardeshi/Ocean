import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { useState } from 'react'
import { FlatList, RefreshControl, View, StyleSheet, Alert } from 'react-native'
import { Card, Avatar, Title, Paragraph, IconButton, ActivityIndicator, useTheme, Portal, Dialog, TextInput, Caption, Button, Colors } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store'
import Post from '../Tabs/Post'
import NewPost from '../Tabs/NewPost'
import { useFocusEffect } from '@react-navigation/native'

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    },
})

const MyPosts = ({ navigation }) => {

    const [posts, setPosts] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(0)
    const [end, setEnd] = React.useState(false)

    // React.useEffect(() => {
    //     getPosts(1, posts)
    // },[])

    useFocusEffect(React.useCallback(() => {
        if (!posts.length)
            getPosts(1, posts)
    },[]))

    const getPosts = (pageno, oldposts) => {
        SecureStore.getItemAsync('token')
        .then(token => {
            return Axios.get(
                `${SERVER_URI}/post/myposts/${pageno}`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => {
            if (!res.data.success) {
                setEnd(true)
                return;
            }
            setPosts([...oldposts, ...res.data.post_list])
            setPage(pageno)
            if (res.data.post_list.length < 10 || !res.data.success)
                setEnd(true)
        })
        .catch(err => {
            if (!!!err.response.data.success)
                setEnd(true)
            else
                alert(err.message)
        })
        .finally(() => {
            setRefreshing(false)
            setLoading(false)
        })
    }

    const handleRefresh = () => {
        setEnd(false)
        setRefreshing(true)
        getPosts(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading && !refreshing) {
            setLoading(true)
            getPosts(page, posts)
        }
    }

    const handleDelete = (id) => {
        SecureStore.getItemAsync("token")
        .then(token => {
            return Axios.delete(
                `${SERVER_URI}/post/${id}/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => handleRefresh())
        .catch(err => alert(err.message))
    }

    const renderItem = ({ item, index }) =>
        <Card
            key={index}
            onPress={() => navigation.push('Post', {item: {...item, post_id: item.id}})}
            onLongPress={() => navigation.push('Edit Post', { 
                id: item.id,
                tag: item.tags.join(' '), 
                title: item.title, 
                description: item.description,
                is_anonymous: item.is_anonymous
            })}
            style={styles.cardStyle}
        >
            <Card.Title
                title={item.title}
                left={
                    props => 
                    <Avatar.Text {...props} label={
                        item.is_anonymous ? "AU" : item.first_name[0]+item.last_name[0]
                    }/>
                }
                subtitle={item.tags.map(v => `#${v}`).join(' ')}
                subtitleNumberOfLines={4}
                subtitleStyle={{color: Colors.blue500}}
                right={
                    props =>
                    <IconButton {...props} icon='delete' onPress={() => {
                        Alert.alert(
                            'Delete post',
                            `Delete post with title: ${item.title}?`,
                            [
                                {
                                    text: 'CANCEL',
                                    style: 'cancel',
                                    onPress: () => {}
                                },
                                {
                                    text: 'DELETE',
                                    style: 'destructive',
                                    onPress: () => handleDelete(item.id)
                                }
                            ],
                            {
                                onDismiss: () => {}
                            }
                        )
                    }}/>
                }
            />
        </Card>

    return(
        <FlatList
            data={posts}
            keyExtractor={(item, index) => item.id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
            ListFooterComponent={
                !refreshing && 
                <Card style={{justifyContent: 'center', alignItems: 'center', marginVertical: 10, paddingVertical: 10}}>
                {
                    end 
                    ?
                    <Caption>
                    {
                        posts.length
                        ?
                        "Welcome to the bottom of Ocean :)"
                        :
                        "You haven't posted yet"
                    }
                        
                    </Caption>
                    :
                    <Caption>
                        Fetching more content for you...
                    </Caption>
                }
                </Card>

            }
            renderItem={renderItem}
        />
    )
}

export default ({ navigation }) => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="My Posts"
                component={MyPosts}
            />
            <Stack.Screen
                name="Post"
                component={Post}
            />
            <Stack.Screen
                name="Edit Post"
                component={NewPost}
            />
        </Stack.Navigator>
    )
}