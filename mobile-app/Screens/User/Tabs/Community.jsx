import * as React from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useTheme, FAB, IconButton, ActivityIndicator, Card, Title, Paragraph, Avatar, Button, Caption } from 'react-native-paper'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

export default ({ route, navigation }) => {
    const theme = useTheme() 
    const [posts, setPosts] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [refreshing, setRefreshing] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)

    useFocusEffect(React.useCallback(() => {
        if (!posts.length)
            getPosts(page, posts)
    },[]))

    const getPosts = (pageno, oldPosts) => 
        SecureStore.getItemAsync("token")
        .then(token => {
            const comm = route.params.name.toLowerCase().split(' ').join('_')
            return Axios.get(
            `${SERVER_URI}/post/${comm}/${pageno}/`,
            {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            }
        )})
        .then(res => {
            setPosts([...oldPosts, ...res.data.post_list])
            if (res.data.post_list.length < 10 || res.data.success)
                setEnd(false)
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
        getPosts(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getPosts(page + 1, posts)
            setPage(page + 1)
        }
    }

    return(
        <>
        <FlatList
            data={posts}
            keyExtractor={(item, index) => index.toString()}
            extraData={posts}
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
                        <Paragraph>{item.description.split(" ").slice(0,25).join(" ") + "..."}</Paragraph>
                    </Card.Content>
                    <Card.Actions style={{justifyContent: 'space-around'}}>
                    <Button
                            icon='thumb-up'
                            // onPress={() => handleLike(index, item.id)}
                            color={item.is_liked ? theme.colors.primary : theme.colors.text}
                            children={item.is_liked ? 'Liked' : 'Like'}
                        />
                        <Button
                            icon='comment'
                            children='Comment'
                            color={theme.colors.text}
                            // onPress={() => {setShowComment(item.id)}}
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
            label='NEW'
            icon='plus'
            onPress={() => navigation.navigate('New Post', {
                id: '', 
                tag: route.params.name.toLowerCase().split(' ').join('_'),
                title: '',
                description: '' 
            })}
            style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0
            }}
        />
        </>
    )
}