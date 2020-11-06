import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View, StyleSheet } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, TouchableRipple, ActivityIndicator, Caption } from 'react-native-paper'
import Post from '../Tabs/Post'

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: { marginTop: 10 }
})

const Likes = ({ navigation }) => {
    const [likes, setLikes] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)
    const isFocused = useIsFocused()

    // React.useEffect(() => {
    //     if (isFocused && likes.length === 0)
    //         getLikes(page, likes)
    // },[isFocused])

    useFocusEffect(React.useCallback(() => {
        if (!likes.length)
            getLikes(1,[])
    },[]))

    const getLikes = (pageno, oldLikes) => {
        setLoading(true)
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
            if (!res.data.success) {
                setEnd(true)
                return;
            }
            setLikes([...oldLikes, ...res.data.like_list])
            setPage(pageno)
            if (res.data.like_list.length < 10)
                setEnd(true)
        })
        .catch(err => {
            if (!!!err.response.data.success)
                setEnd(true)
            else
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
        getLikes(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getLikes(page + 1, likes)
            setPage(page + 1)
        }
    }

    const renderItem = ({item, index}) =>
        <Card
            key={index}
            onPress={() => navigation.navigate('Post', {item: {...item, id: item.post_id}})}
            style={styles.cardStyle}
        >
            <Card.Title
                key={index}
                title={item.is_anonymous ? "Anonymous user" : item.author}
                subtitle={item.post_title}
                subtitleNumberOfLines={3}
                left={props => 
                    <Avatar.Text 
                    {...props} 
                    label={
                        item.is_anonymous ? "AU" : item.author.split(" ").map(str => str[0]).join("")
                    }/>
                }
            />
        </Card>

    return(
        <FlatList
            data={likes}
            extraData={likes}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            onEndReached={handleEnd}
            onEndReachedThreshold={0.1}
            ListFooterComponent={
                !refreshing && 
                <Card.Title
                    subtitle={!likes.length ? "You haven't liked any posts yet" : end ? 'Welcome to the bottom of Ocean :)' : 'Fetching more content for you...'}
                />
            }
            renderItem={renderItem}
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