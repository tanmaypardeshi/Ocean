import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View, Alert, StyleSheet } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, ActivityIndicator, Caption, Button, TextInput, Portal, Dialog, List, Switch } from 'react-native-paper'
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
    const [commentId, setCommentId] = React.useState(-1)
    const [newComment, setNewComment] = React.useState('')
    const [is_anonymous, set_is_anonymous] = React.useState(false)
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)
    const isFocused = useIsFocused()

    useFocusEffect(React.useCallback(() => {
        if (!comments.length)
            getComments(1,[])
    },[]))

    const getComments = (pageno, oldComments) => {
        setLoading(true)
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
            if (!res.data.success) {
                setEnd(true)
                return;
            }
            setComments([...oldComments, ...res.data.comment_list])
            setPage(pageno)
            if (res.data.comment_list.length < 10)
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
        getComments(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getComments(page + 1, comments)
            setPage(page + 1)
        }
    }

    const patchComment = () => {
        setEditing(true)
        SecureStore.getItemAsync("token")
        .then(token =>
            Axios.patch(
                `${SERVER_URI}/post/comment/${commentId}/`,
                {
                    "id": commentId,
                    "content": newComment,
                    is_anonymous
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
            const index = comments.findIndex(obj => obj.comment_id === commentId)
            let newCommArray = [...comments]
            newCommArray[index] = {
                ...newCommArray[index], 
                content: newComment,
                is_anonymous
            }
            setComments(newCommArray)
            setCommentId(-1)
            setNewComment('')
        })
        .catch(err => alert(err.message))
        .finally(() => {
            setEditing(false)
        })
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
        .then(res => {
            let newCommArray = comments.filter(obj => obj.comment_id !== id)
            setComments(newCommArray)
        })
        .catch(err => alert(err.message))
    }

    const renderItem = ({ item, index }) => 
    <Card
        key={index}
        style={styles.cardStyle}
        onPress={() => navigation.navigate('Post', {item: {...item, id: item.post_id}})}
        onLongPress={() => {
            setNewComment(item.content)
            setCommentId(item.comment_id)
            set_is_anonymous(item.is_anonymous)
        }}
    >
        <Card.Title
            title={item.content}
            titleNumberOfLines={10}
            subtitle={
                item.post_title +
                ", by " + item.author + " at " + item.published_at.split("T")[0]
            }
            subtitleNumberOfLines={10}
            left={props => 
                <Avatar.Icon {...props} icon={item.is_anonymous ? 'incognito' : 'eye'}/>
            }
            right={props => <IconButton {...props} icon='delete' onPress={() => Alert.alert(
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
            )}/>}
        />
    </Card>

    return(
        <>
        <FlatList
            data={comments}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
            onEndReachedThreshold={0.1}
            renderItem={renderItem}
            ListFooterComponent={
                !refreshing && 
                <Card style={{justifyContent: 'center', alignItems: 'center', marginVertical: 10, paddingVertical: 10}}>
                    {
                        !comments.length
                        ?
                        <Caption>You haven't commented yet</Caption>
                        :
                        end 
                        ?
                        <Caption>Welcome to the bottom of Ocean :)</Caption>
                        :
                        <Caption>Fetching more content for you...</Caption>
                    }
                </Card>
            }
        />
        <Portal>
            <Dialog
                visible={commentId !== -1}
                onDismiss={() => setCommentId(-1)}
            >
                <Dialog.Title>Modify Comment</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        value={newComment}
                        mode="flat"
                        style={{ backgroundColor: 'transparent' }}
                        onChangeText={setNewComment}
                        multiline
                    />
                    <List.Item
                        title="Anonymity"
                        right={props => 
                            <Switch 
                                style={props.style}
                                value={is_anonymous}
                                onValueChange={set_is_anonymous}
                            />
                        }
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button
                        onPress={() => setCommentId(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onPress={patchComment}
                    >
                    {editing ? "Changing" : "Change"}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
        </>
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