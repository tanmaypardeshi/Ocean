import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View, Alert, StyleSheet } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, ActivityIndicator, Caption, Button, TextInput } from 'react-native-paper'
import Post from '../Tabs/Post'

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

const Stack = createStackNavigator()

const Comment = ({ navigation }) => {
    const [comments, setComments] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [refreshing, setRefreshing] = React.useState(true)
    const [editing, setEditing] = React.useState(false)
    const [newComment, setNewComment] = React.useState('')
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused && comments.length === 0)
            getComments(page, comments)
    },[isFocused])

    const getComments = (pageno, oldComments) => {
        SecureStore.getItemAsync("token")
        .then(token => 
            Axios.get(
                `${SERVER_URI}/post/mycomments/${pageno}`,
                {
                    headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`}
                }
            )    
        )
        .then(res => {
            setComments([...comments, ...res.data.comment_list])
            if (res.data.comment_list.length < 10 || res.data.success)
                setEnd(true)
        })
        .catch(err => {
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
        setPage(1)
        getComments(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getComments(page + 1, comments)
            setPage(page + 1)
        }
    }

    const patchComment = (commentId) => {
        setEditing(true)
        SecureStore.getItemAsync("token")
        .then(token =>
            Axios.patch(
                `${SERVER_URI}/post/comment/`,
                {
                    "id": commentId,
                    "content": newComment
                },
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setNewComment('')
        })
        .catch(err => alert(err.message))
        .finally(() => setEditing(false))
    }

    const handleDelete = (id) => {
        SecureStore.getItemAsync("token")
        .then(token => 
            Axios.delete(
                `${SERVER_URI}/post/comment/${id}`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        )
        .catch(err => alert(err.message))
        .finally(handleRefresh)
    }

    return(
        <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
            renderItem={({ item, index }) => 
                <Card
                    key={index}
                    style={styles.cardStyle}
                    onPress={() => navigation.push('Post', {item})}
                    onLongPress={() => Alert.alert(
                        "Delete comment",
                        "Your comment will be completely deleted. Proceed?",
                        [
                            {
                                text: 'Cancel',
                                style: 'cancel',
                                onPress: () => {}
                            },
                            {
                                text: 'Delete',
                                style: 'delete',
                                onPress: () => handleDelete(item.comment_id)
                            }
                        ]
                    )}
                >
                    <Card.Title
                        title={item.post_title}
                        subtitle={item.author + " at " + item.published_at.split("T")[0]}
                        left={props => <Avatar.Text {...props} label={item.author.split(" ").map(str => str[0]).join("")}/>}
                        right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                    <Card.Content>
                        <TextInput
                            defaultValue={item.content}
                            onChangeText={setNewComment}
                            multiline
                            right={
                                <TextInput.Icon 
                                    name={editing ? 'update' : 'pencil'} 
                                    onPress={() => patchComment(item.comment_id)}
                                />
                            }
                        />
                    </Card.Content>
                </Card>
            }
            ListFooterComponent={
                !loading && 
                <Card style={{justifyContent: 'center', alignItems: 'center', marginVertical: 10, paddingVertical: 10}}>
                    {
                        end 
                        ?
                        <Caption>Welcome to the bottom of Ocean :)</Caption>
                        :
                        <Caption>Fetching more content for you...</Caption>
                    }
                </Card>
            }
        />
    )
}

export default ({ navigation }) => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='My Comments'
                component={Comment}
            />
            <Stack.Screen
                name='Post'
                component={Post}
            />
        </Stack.Navigator>
    )
}