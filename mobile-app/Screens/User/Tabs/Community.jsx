import * as React from 'react'
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native'
import { useTheme, FAB, IconButton, ActivityIndicator } from 'react-native-paper'
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
    const [refreshing, setRefreshing] = React.useState(false)
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
        .then(token => {
            const comm = route.params.name.toLowerCase().split(' ').join('_')
            return Axios.get(
            `${SERVER_URI}/post/${comm}/`,
            {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            }
        )})
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
            keyExtractor={(item, index) => index.toString()}
            extraData={posts}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={({ item, index }) => 
                <Card
                    key={index}
                    onPress={() => navigation.navigate('Post', {item})}
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
            label='NEW'
            icon='plus'
            onPress={() => navigation.navigate('New Post', { tag: route.params.name.toLowerCase().split(' ').join('_') })}
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