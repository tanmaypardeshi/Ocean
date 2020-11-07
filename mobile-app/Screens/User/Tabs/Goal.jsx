import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Headline, Checkbox, FAB, Avatar, List, DataTable as DT, ActivityIndicator, Switch, Divider, Caption, Title, Subheading } from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import Axios from 'axios';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';
import { useIsFocused } from '@react-navigation/native';

const styles = StyleSheet.create({
    cardStyle: {
        marginVertical: 10
    }
})

export default ({navigation, route}) => {
    const [loading, setLoading] = React.useState(true)
    const [checkedUp, setCheckedUp] = React.useState([])
    const [checkedDown, setCheckedDown] = React.useState([])
    const [goal, setGoal] = React.useState({})
    const [fabIcon, setFabIcon] = React.useState('pencil')
    const [currentUser, setCurrentUser] = React.useState(false)
    const [progress1, setProgress1] = React.useState(0)
    const [progress2, setProgress2] = React.useState(0)
    const isFocused = useIsFocused()

    React.useEffect(() => {
        getData()
    },[])

    const getData = () => {
        SecureStore.getItemAsync('token')
        .then(token =>
            Axios.get(
                `${SERVER_URI}/cheer/${route.params.item.id}/`,
                {
                    headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`}
                }
            )
        )
        .then(res => {
            console.log(res.data.data)
            setGoal(res.data.data)
            setCheckedUp(res.data.data.subtasks.map(obj => obj.is_subtask))
            setCurrentUser(res.data.data.current_user.length > 0)
            if (res.data.data.current_user.length > 0)
                setCheckedDown(res.data.data.current_user.map(obj => obj.is_subtask))
            setProgress1(Math.round(res.data.data.progress1))
            setProgress2(Math.round(res.data.data.progress2))
            setFabIcon('pencil')
        })
        .catch(err => alert(err.message))
        .finally(() => {
            setLoading(false)
        })
    }

    const updateTask = () => {
        setFabIcon('update')
        SecureStore.getItemAsync('token')
        .then(token => 
            Axios.patch(
                `${SERVER_URI}/cheer/update/`,
                {
                    "id": route.params.item.id,
                    "subtasks": 
                    checkedDown.length > 0 
                    ? 
                    goal.subtasks
                    .filter((obj, index) => checkedDown[index])
                    .map(obj => ({"title": obj.title}))
                    :
                    goal.subtasks
                    .filter((obj, index) => checkedUp[index])
                    .map(obj => ({"title": obj.title}))
                },
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )
        )
        .catch(err => alert(err.message))
        .finally(getData)
    }

    return(
        !loading ?
        <>
        <ScrollView style={{flexGrow: 1}}>
            <Card.Title
                title={goal.task}
                subtitle={goal.created_by}
                left={props => <Subheading {...props}>{progress1}%</Subheading>}
            />
            <List.Section>
            {
                goal.subtasks.map((obj, index) =>
                    <List.Item
                        key={index}
                        title={obj.title}
                        right={props =>
                            <Switch 
                                style={props.style}
                                value={checkedUp[index]}
                                onValueChange={value => {
                                    let temp = [...checkedUp]
                                    temp[index] = value
                                    setCheckedUp(temp)
                                }}
                                disabled={!route.params.item.is_taken || currentUser}
                            />
                        }
                    />   
                )
            }
            </List.Section>
            {
                currentUser && 
                <>
                    <Divider style={{marginVertical: 10}}/>
                    <Card.Title
                        title='Your Progress'
                        left={props => <Subheading {...props}>{progress2}%</Subheading>}
                    />
                    <List.Section>
                    {
                        goal.subtasks.map((obj, index) =>
                            <List.Item
                                key={index}
                                title={obj.title}
                                right={props =>
                                    <Switch 
                                        style={props.style}
                                        value={checkedDown[index]}
                                        onValueChange={value => {
                                            let temp = [...checkedDown]
                                            temp[index] = value
                                            setCheckedDown(temp)
                                        }}
                                    />
                                }
                            />   
                        )
                    }
                    </List.Section>
                </>
            }
        </ScrollView>
        {
            route.params.item.is_taken && 
            <FAB
                label={fabIcon === "pencil" ? 'Update' : 'Updating'}
                icon={fabIcon}
                onPress={updateTask}
                style={{
                    position: 'absolute',
                    margin: 16,
                    right: 0,
                    bottom: 0
                }}
            />
        }
        </>
        :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}