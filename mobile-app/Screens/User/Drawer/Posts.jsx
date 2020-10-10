import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { useState } from 'react'
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native'
import { Card, Avatar, Title, Paragraph, IconButton, ActivityIndicator, useTheme } from 'react-native-paper'
import * as SecureStore from 'expo-secure-store'
import Post from '../Tabs/Post'

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

    return(
        !loading ?
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
                        title={item.first_name + " " + item.last_name}
                        subtitle={new Date(item.published_at).toLocaleString()}
                        left={props => <Avatar.Text {...props} label={item.first_name[0] + item.last_name[0]}/>}
                        right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                    <Card.Content>
                        <Title>{item.title}</Title>
                        <Paragraph>{item.description}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{justifyContent: 'space-around'}}>
                        <IconButton 
                            icon='thumb-up' 
                            color={item.is_liked ? theme.colors.primary : theme.colors.text}
                            onPress={() => handleLike(index)}
                        />
                        <IconButton icon='comment'/>
                        <IconButton icon='share-variant'/>
                    </Card.Actions>
                </Card>
            }
        />
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
        </Stack.Navigator>
    )
}