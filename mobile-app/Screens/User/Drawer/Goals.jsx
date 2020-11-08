import * as React from 'react'
import { useIsFocused } from '@react-navigation/native'
import { getItemAsync } from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { FlatList } from 'react-native-gesture-handler'
import { RefreshControl, StyleSheet, View } from 'react-native'
import { Card, Caption, Avatar } from 'react-native-paper'
import { createStackNavigator } from '@react-navigation/stack'
import Goal from '../Tabs/Goal'

const cardStyle = {
    marginTop: 10
}

const Goals = ({navigation}) => {
    const [goals, setGoals] = React.useState([])
    const [refreshing, setRefreshing] = React.useState(true)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused)
            getMyGoals()
    },[isFocused])

    const getMyGoals = () => {
        getItemAsync('token')
        .then(token => 
            Axios.get(
                `${SERVER_URI}/cheer/mytasks/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setGoals(res.data.post_list)
        })
        .catch(err => alert(err.message))
        .finally(() => {
            setRefreshing(false)
        })
    }

    const handleRefresh = () => {
        setRefreshing(true)
        getMyGoals()
    }

    const renderitem = ({item, index}) =>
        <Card
            key={index}
            onPress={() => navigation.navigate('Goal', {item})}
            style={cardStyle}
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
        </Card>

    return(
        <FlatList
            data={goals}
            extraData={goals}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/>
            }
            renderItem={renderitem}
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