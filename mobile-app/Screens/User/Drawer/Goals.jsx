import * as React from 'react'
import { useIsFocused } from '@react-navigation/native'
import { getItemAsync } from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList } from 'react-native-gesture-handler'
import { RefreshControl, View } from 'react-native'
import { Card, Button, ActivityIndicator, Caption } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack'
import Goal from '../Tabs/Goal'

const Goals = ({navigation}) => {
    const [goals, setGoals] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const [loading, setLoading] = React.useState(true)
    const [page, setPage] = React.useState(1)
    const [end, setEnd] = React.useState(false)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused)
            getMyGoals(page, goals)
    },[isFocused])

    const getMyGoals = (pageno, oldGoals) => {
        getItemAsync('token')
        .then(token => 
            Axios.get(
                `${SERVER_URI}/cheer/mytasks/${pageno}`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setGoals([...oldGoals, ...res.data.post_list])
            if (res.data.post_list < 10 || res.data.success)
                setEnd(true)
        })
        .catch(err => alert(err.message))
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
            const id = goals[index].id
            if (goals[index].is_taken){
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
            let tempgoals = [...goals]
            tempgoals[index].is_taken = !goals[index].is_taken
            setGoals(tempgoals)
        })
        .catch(err => alert(err.message))
    }

    const handleRefresh = () => {
        setEnd(false)
        setRefreshing(true)
        setPage(1)
        getMyGoals(1, [])
    }

    const handleEnd = () => {
        if (!end && !loading) {
            getMyGoals(page + 1, goals)
            setPage(page + 1)
        }
    }

    return(
        <FlatList
            data={goals}
            extraData={goals}
            keyExtractor={(item, index) => index.toString()}
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
                    onPress={() => navigation.navigate('Goal', {item})}
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
    )
}

const Stack = createStackNavigator()

export default ({ navigation }) => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="My Goals"
                component={Goals}
            />
            <Stack.Screen
                name="Goal"
                component={Goal}
            />
        </Stack.Navigator>
    )
}