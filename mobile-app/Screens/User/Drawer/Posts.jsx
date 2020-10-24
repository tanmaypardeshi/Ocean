import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { useState } from 'react'
import { FlatList, RefreshControl, View, StyleSheet, Alert } from 'react-native'
import { Card, Avatar, Title, Paragraph, IconButton, ActivityIndicator, useTheme, Portal, Dialog, TextInput } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store'
import Post from '../Tabs/Post'
import NewPost from '../Tabs/NewPost'

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

const MyPosts = ({ navigation }) => {

    const [posts, setPosts] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [showComment, setShowComment] = React.useState(0)
    const [comment, setComment] = React.useState('')
    const isFocused = useIsFocused()
    const theme = useTheme()

    React.useEffect(() => {
        if (isFocused && posts.length === 0)
            getPosts()
    },[isFocused])

    const getPosts = () => {
        SecureStore.getItemAsync('token')
        .then(token => {
            return Axios.get(
                `${SERVER_URI}/post/myposts/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => {
            setPosts(res.data.post_list)
        })
        .catch(err => {
            alert(err.message)
        })
        .finally(() => {
            setRefreshing(false)
            setLoading(false)
        })
    }

    const handleLike = (index) => {
        SecureStore.getItemAsync('token')
        .then(token => {
            let uri = "like"
            if (posts[index].is_liked){
                uri = "unlike"
            }
            return Axios.post(
                `${SERVER_URI}/post/${uri}/`,
                { "id": posts[index].id },
                { headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`} }
            )    
        })
        .then(res => {
            let tempPosts = [...posts]
            tempPosts[index].is_liked = !posts[index].is_liked
            setPosts(tempPosts);
        })
        .catch(err => alert(err.message))
    }

    const handleRefresh = () => {
        setRefreshing(true)
        getPosts()
    }

    const handleComment = () => {
        SecureStore.getItemAsync('token')
        .then(token => {
            let data = {
                "parent_id": null,
                "content": comment
            }
            console.log(data)
            return Axios.post(
                `${SERVER_URI}/post/comment/${showComment}/`,
                data,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => {
            setShowComment(0)
            setComment('')
        })
        .catch(err => {
            alert(err.message)
        })
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

    return(
        !loading ?
        <>
        <FlatList
            data={posts}
            keyExtractor={(item, index) => index.toString()}
            extraData={posts}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={({ item, index }) => 
                <Card
                    key={index}
                    onPress={() => navigation.navigate('Post', {item: {...item, post_id: item.id}})}
                    style={styles.cardStyle}
                >
                    <Card.Title
                        title={item.title}
                        subtitle={new Date(item.published_at).toLocaleString()}
                    />
                    <Card.Content>
                        <Paragraph>{item.description}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{justifyContent: 'space-around'}}>
                        <IconButton 
                            icon='thumb-up' 
                            color={item.is_liked ? theme.colors.primary : theme.colors.text}
                            onPress={() => handleLike(index)}
                        />
                        <IconButton icon='comment' onPress={() => {setShowComment(item.id)}}/>
                        <IconButton icon='pencil'/>
                        <IconButton icon='delete' onPress={() => {
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
                        <IconButton icon='share-variant'/>
                    </Card.Actions>
                </Card>
            }
        />
        <Portal>
            <Dialog
                visible={showComment > 0}
                onDismiss={() => setShowComment(0)}
            >
                <Dialog.Title>Comment</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        type='flat'
                        placeholder='Your comment'
                        style={{ backgroundColor: 'transparent' }}
                        value={comment}
                        onChangeText={setComment}
                        multiline
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button 
                        onPress={() => setShowComment(0)}
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={comment.length === 0}
                        onPress={handleComment}
                    >
                        Send
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
        </>
        :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
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