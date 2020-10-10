import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import Axios from 'axios'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused } from '@react-navigation/native'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList, RefreshControl, View } from 'react-native'
import { Card, Avatar, IconButton, Paragraph, ActivityIndicator } from 'react-native-paper'

const Stack = createStackNavigator()

const Comment = ({ navigation }) => {
    const [comments, setComments] = React.useState([])
    const [loading, setLoading] = React.useState(true)
    const [refreshing, setRefreshing] = React.useState(false)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused && comments.length === 0)
            getComments()
    },[isFocused])

    const getComments = () => {
        SecureStore.getItemAsync(token)
        .then(token => 
            Axios.get(
                `${SERVER_URI}/post/mycomments/`,
                {
                    headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`}
                }
            )    
        )
        .then(res => {
            setComments(res.data.comment_list)
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
        setRefreshing(true)
        getComments()
    }

    return(
        !loading ?
        <FlatList
            data={comments}
            extraData={comments}
            keyExtractor={(item, index) => item.comment_id.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={({ item, index }) => 
                <Card
                    key={index}
                    onPress={() => navigation.navigate('Post', {item})}
                >
                    <Card.Title
                        title={item.post_title}
                        subtitle={item.author + " at " + item.published_at}
                        left={props => <Avatar.Text {...props} label={item.author.split(" ").map(str => str[0]).join("")}/>}
                        right={props => <IconButton {...props} icon='dots-vertical'/>}
                    />
                    <Card.Content>
                        <Paragraph>
                            {item.content}
                        </Paragraph>
                    </Card.Content>
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
    return (
        <Stack.Navigator>
            <Stack.Screen
                name='My Comments'
                component={Comment}
            />
        </Stack.Navigator>
    )
}