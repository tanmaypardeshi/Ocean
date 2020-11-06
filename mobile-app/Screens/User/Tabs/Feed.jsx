import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { IconButton, useTheme, Card, Avatar, Title, Paragraph, FAB, ActivityIndicator, Button, Portal, Dialog, TextInput, Caption, Chip } from 'react-native-paper';
import { Alert, FlatList, StyleSheet, RefreshControl, View, BackHandler } from 'react-native';
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
    },
    personalityView: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
})

const Feed = ({navigation}) => {
    const theme = useTheme()
    const [posts, setPosts] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const [loading, setLoading] = React.useState(true)
    const [showComment, setShowComment] = React.useState(0)
    const [comment, setComment] = React.useState('')
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)

    useFocusEffect(React.useCallback(() => {
        if (!posts.length)
            getPosts(page, posts)
        // return () => {
        //     setPage(1);
        //     setPosts(posts.slice(0, 20))
        //     setEnd(false)
        // }
    },[]))

    const handleLogOut = () => {
        SecureStore.deleteItemAsync('token')
        .then(() => navigation.navigate("Auth"))
        .catch(console.log)
    }

    useFocusEffect(React.useCallback(() => {
        const onBackPress = () => {
            Alert.alert(
                'Log out', 
                'Are you sure you want to log out?',
                [
                    {
                        text: 'CANCEL',
                        style: 'cancel',
                        onPress: () => {}
                    },
                    {
                        text: 'LOG OUT',
                        style: 'destructive',
                        onPress: handleLogOut
                    }
                ]
            )
            return true
        }

        BackHandler.addEventListener('hardwareBackPress', onBackPress)
        return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, []))
    

    const getPosts = (pageno, oldposts) => 
        SecureStore.getItemAsync("token")
        .then(token => Axios.get(
            `${SERVER_URI}/post/wall/${pageno}`,
            {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6InRhbm1heXBhcmRlc2hpQGdtYWlsLmNvbSIsImV4cCI6MTYwNjIzNDA4MCwiZW1haWwiOiJ0YW5tYXlwYXJkZXNoaUBnbWFpbC5jb20ifQ.97TUdXxngEq0v3OByKGM9ucWyDTMTgjj1zndtkFr4cM`
                }
            }
        ))
        .then(res => {
            setPosts([...oldposts, ...res.data.post_list])
            if (res.data.post_list.length < 20 || !res.data.success)
                setEnd(true)
        })
        .catch(err => alert(err.message))
        .finally(() => {
            setLoading(false)
            setRefreshing(false)
        })

    const handleRefresh = () => {
        setEnd(false)
        setRefreshing(true)
        setPage(1)
        getPosts(1,[])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getPosts(page + 1, posts)
            setPage(page + 1)
        }
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

    const renderItem = ({ item, index }) => 
        <Card
            key={index}
            onPress={() => navigation.push('Post', {item: {...item, post_id: item.id}})}
            style={styles.cardStyle}
        >
            <Card.Title
                title={item.first_name + " " + item.last_name}
                subtitle={item.published_at.split("T")[0]}
                left={props => <Avatar.Text {...props} label={item.first_name[0] + item.last_name[0]}/>}
                //right={props => <IconButton {...props} icon='dots-vertical'/>}
            />
            <Card.Content>
                <View style={styles.personalityView}>
                {
                    item.tags.map((v, i) =>
                        <Chip key={i} style={{margin: 2}}>{v.split('_').join(' ')}</Chip>
                    )
                }
                </View>
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

    return(
        <>
        <FlatList
            data={posts}
            keyExtractor={(item, index) => index.toString()}
            // extraData={posts}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
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
            renderItem={renderItem}
            removeClippedSubviews={true}
            
        />
        <FAB
            icon='plus'
            onPress={() => navigation.push('New Post', { id: '', tag: '', title: '', description: ''})}
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