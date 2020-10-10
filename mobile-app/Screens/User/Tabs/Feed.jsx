import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { IconButton, useTheme, Card, Avatar, Title, Paragraph, FAB, ActivityIndicator } from 'react-native-paper';
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
    const isVisible = useIsFocused()

    // React.useEffect(() => {
    //     if (isVisible && !posts.length)
    //         getPosts()
    // },[isVisible])

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
                        right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                    <Card.Content>
                        <Title>{item.title}</Title>
                        <Paragraph>{item.description}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{justifyContent: 'space-around'}}>
                        <IconButton icon='thumb-up' color={item.is_liked ? theme.colors.primary : theme.colors.text}/>
                        <IconButton icon='comment'/>
                        <IconButton icon='share-variant'/>
                    </Card.Actions>
                </Card>
            }
        />
        <FAB
            label='POST'
            icon='plus'
            onPress={() => navigation.navigate('New Post', { tag: ''})}
            style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0
            }}
        />
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