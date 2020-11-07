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
    const [refreshing, setRefreshing] = React.useState(true)
    const [page, setPage] = React.useState(0)
    const [end, setEnd] = React.useState(false)

    useFocusEffect(React.useCallback(() => {
        if (tasks.length === 0) 
            getTasks(1, tasks)
    },[]))

    const getTasks = (pageno, oldtasks) => {
        SecureStore.getItemAsync('token')
        .then(token => 
            Axios.get(
                `${SERVER_URI}/cheer/gettasks/${pageno}/`,
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            if (!!!res.data.success) {
                setEnd(true)
                return;
            }
            setTasks([...oldtasks, ...res.data.post_list])
            setPage(pageno)
            if (res.data.post_list.length < 10)
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

    const handleTaken = index =>
        SecureStore.getItemAsync('token')
        .then(token => {
            // console.log(tasks[index].id, token)
            return Axios.post(
                `${SERVER_URI}/cheer/follow/`,
                {
                    "id": tasks[index].id
                },
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        })
        .then(res => {
            let tempTasks = [...tasks]
            tempTasks[index].is_taken = !tasks[index].is_taken
            setTasks(tempTasks)
        })
        .catch(err => alert(err.message))
    

    const handleRefresh = () => {
        setEnd(false)
        setRefreshing(true)
        getTasks(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading && !refreshing) {
            setLoading(true)
            getTasks(page+1, tasks)
        }
    }

    const renderItem = ({ item, index }) =>
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
                right={props =>
                    !item.is_taken && 
                    <IconButton 
                        {...props}
                        icon='bookmark-plus'
                        onPress={() => handleTaken(index)}
                    />
                }
            />
            <Card.Content>
                {
                    item.subtasks.map((st, index) => 
                        <Caption key={index}>{st.title}</Caption>
                    )
                }
            </Card.Content>
        </Card>

    return(
        <>
        <FlatList
            data={tasks}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={renderItem}
            onEndReached={handleEnd}
            ListFooterComponent={
                !refreshing &&
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