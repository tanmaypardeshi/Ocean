import { createStackNavigator } from '@react-navigation/stack'
import Axios from 'axios'
import { getItemAsync } from 'expo-secure-store'
import * as React from 'react'
import { RefreshControl, ScrollView, StyleSheet } from 'react-native'
import { Card, IconButton, Searchbar } from 'react-native-paper'
import { AXIOS_HEADERS, SERVER_URI } from '../../../Constants/Network'
import Post from './Post'

const Stack = createStackNavigator()

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

const Search = ({ navigation }) => {

    const [results, setResults] = React.useState([])
    const [search, setSearch] = React.useState('')
    const [refreshing, setRefreshing] = React.useState(false)

    const handleSearch = () => {
        setRefreshing(true)
        getItemAsync('token')
        .then(token => 
            Axios.post(
                `${SERVER_URI}/search/`,
                {
                    query: search
                },
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setResults(res.data.search_results)
        })
        .catch(err => alert(err.message))
        .finally(() => setRefreshing(false))
    }


    return(
        <ScrollView 
            style={{flex:1}}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleSearch}/>
            }
        >
        <Searchbar
            placeholder="Search"
            onChangeText={setSearch}
            value={search}
            onIconPress={handleSearch}
            onSubmitEditing={handleSearch}
        />
        {
            results.map((obj, index) =>
                <Card
                    key={index}
                    onPress={() => navigation.navigate('Post', { item: { id: obj.id }})}
                    style={styles.cardStyle}
                >
                    <Card.Title
                        key={index}
                        title={obj.title}
                        titleNumberOfLines={10}
                    />
                </Card>
            )
        }
        </ScrollView>
    )
}

export default ({ navigation }) => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Search"
                component={Search}
                options={{
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
            />
            <Stack.Screen
                name="Post"
                component={Post}
            />
        </Stack.Navigator>
    )
}