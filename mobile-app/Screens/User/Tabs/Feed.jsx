import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { IconButton, useTheme, Card, Avatar, Title, Paragraph, FAB, ActivityIndicator, Button, Portal, Dialog, TextInput } from 'react-native-paper';
import { Alert, FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Axios from 'axios'
import { useIsFocused, useFocusEffect } from '@react-navigation/native';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';
import NewPost from './NewPost';
import Post from './Post';

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

const Feed = ({navigation}) => {
    const theme = useTheme()
    const [posts, setPosts] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [showComment, setShowComment] = React.useState(0)
    const [comment, setComment] = React.useState('')

    useFocusEffect(React.useCallback(() => {
        if (!posts.length)
            getPosts()
    },[]))

    const getPosts = () => 
        SecureStore.getItemAsync("token")
        .then(token => Axios.get(
            `${SERVER_URI}/post/wall/`,
            {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            }
        ))
        .then(res => setPosts(res.data.post_list))
        .catch(err => alert(err.message))
        .finally(() => {
            setLoading(false)
            setRefreshing(false)
        })

    const handleRefresh = () => {
        setRefreshing(true)
        getPosts()
    }

    const handleLike = (index, id) => {
        SecureStore.getItemAsync('token')
        .then(token => {
            const urlEnd = posts[index].is_liked ? "unlike" : "like"
            return Axios.post(
                `${SERVER_URI}/post/${urlEnd}/`,
                { id },
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
        })
        .then(res => {
            let tP = [...posts]
            tP[index].is_liked = !posts[index].is_liked
            setPosts(tP)
        })
        .catch(err => {
            alert(err.message)
        })
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

    return(
        !loading ?
        <>
        <FlatList
            data={posts}
            keyExtractor={(item, index) => item.id.toString()}
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
                        title={item.first_name + " " + item.last_name}
                        subtitle={new Date(item.published_at).toLocaleString()}
                        left={props => <Avatar.Text {...props} label={item.first_name[0] + item.last_name[0]}/>}
                        //right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                    <Card.Content>
                        <Title>{item.title}</Title>
                        <Paragraph>{item.description.split(" ").slice(0,25).join(" ") + "..."}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{justifyContent: 'space-around'}}>
                        <Button
                            icon='thumb-up'
                            onPress={() => handleLike(index, item.id)}
                            color={item.is_liked ? theme.colors.primary : theme.colors.text}
                            children={item.is_liked ? 'Liked' : 'Like'}
                        />
                        <Button
                            icon='comment'
                            children='Comment'
                            color={theme.colors.text}
                            onPress={() => {setShowComment(item.id)}}
                        />
                        <Button
                            icon='share-variant'
                            children='Share'
                            color={theme.colors.text}
                        />
                    </Card.Actions>
                </Card>
            }
        />
        <FAB
            label='POST'
            icon='plus'
            onPress={() => navigation.navigate('New Post', { tag: '', title: '', description: ''})}
            style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0
            }}
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

export default ({navigation}) => {
    return(
        <Stack.Navigator initialRouteName="FeedTab">
            <Stack.Screen 
                name="FeedTab"
                component={Feed}
                options={{
                    headerTitle: 'Feed',
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
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