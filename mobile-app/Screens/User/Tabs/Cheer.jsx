import * as React from 'react'
import * as SecureStore from 'expo-secure-store'
import { View, FlatList, RefreshControl, StyleSheet} from 'react-native'
import { Button, IconButton, Card, FAB, ActivityIndicator, Headline, Avatar, Caption } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import NewGoal from './NewGoal'
import Goal from './Goal'

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

const cheerScreen = ({navigation}) => {
    const [loading, setLoading] = React.useState(true)
    const [tasks, setTasks] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(false)
    const isFocused = useIsFocused()

    useFocusEffect(React.useCallback(() => {
        if (tasks.length === 0) 
            getTasks()
    },[]))

    const getTasks = () => {
        SecureStore.getItemAsync('token')
        .then(token => 
            Axios.get(
                `${SERVER_URI}/cheer/gettasks/`,
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setTasks(res.data.post_list)
        })
        .catch(err => {
            alert(err.message)
        })
        .finally(() => {
            setRefreshing(false)
            setLoading(false)
        })
    }

    const handleTaken = (index) => {
        SecureStore.getItemAsync('token')
        .then(token => {
            let method = "POST"
            let uri = "follow"
            const id = tasks[index].id
            if (tasks[index].is_taken){
                method = "DELETE"
                uri = "unfollow"
            }
            return Axios({
                url: `${SERVER_URI}/cheer/${uri}/${id}`,
                headers: {
                    ...AXIOS_HEADERS,
                    "Authentication": `Bearer ${token}`
                },
                method
            })
        })
        .then(res => {
            let tempTasks = [...tasks]
            tempTasks[index].is_taken = !tasks[index].is_taken
            setTasks(tempTasks)
        })
        .catch(err => alert(err.message))
    }

    const handleRefresh = () => {
        setRefreshing(true)
        getTasks()
    }

    return(
        !loading
        ?
        <>
        <FlatList
            data={tasks}
            extraData={tasks}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={({ item, index }) =>
                <Card
                    key={index}
                    onPress={() => navigation.navigate('Goal', {item})}
                    style={styles.cardStyle}
                >
                    <Card.Title
                        title={item.task}
                        subtitle={item.created_by}
                        left={props => 
                            <Avatar.Text {...props} label={item.created_by.split(" ").map(str => str[0]).join("")}/>
                        }
                    />
                    <Card.Content>
                        {
                            item.subtasks.map((st, index) => 
                                <Caption key={index}>{st.title}</Caption>
                            )
                        }
                    </Card.Content>
                    <Card.Actions>
                        <Button 
                            icon={item.is_taken ? 'minus' : 'plus'}
                            onPress={() => handleTaken(index)}
                        >
                            {item.is_taken ? 'Remove' : 'Follow'}
                        </Button>
                    </Card.Actions>
                </Card>
            }
        />
        <FAB
            icon='plus'
            onPress={() => navigation.navigate('New Goal')}
            style={{
                position: 'absolute',
                margin: 16,
                right: 0,
                bottom: 0
            }}
        />
        </>
        :
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}

export default ({navigation}) => {
    return(
        <Stack.Navigator initialRouteName="Cheer">
            <Stack.Screen
                name="Cheer"
                component={cheerScreen}
                options={{
                    headerTitle: 'Cheer Squad',
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>,
                }}
            />
            <Stack.Screen
                name="New Goal"
                component={NewGoal}
            />
            <Stack.Screen
                name="Goal"
                component={Goal}
            />
        </Stack.Navigator>
    )
}