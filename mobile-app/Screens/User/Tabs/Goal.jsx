import * as React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Headline, Checkbox, FAB, Avatar, List, DataTable as DT, ActivityIndicator } from 'react-native-paper';
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
    const [goal, setGoal] = React.useState({})
    const [checked, setChecked] = React.useState([])
    const [fabIcon, setFabIcon] = React.useState('pencil')
    const isFocused = useIsFocused()

    React.useEffect(() => {
        if (isFocused)
            getData()
    },[isFocused])

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
            const { current_user, ...rest } = res.data
            setGoal(rest)
            setChecked(current_user.table)
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
                    "subtasks": checked
                        .filter(subtask => subtask.is_subtask)
                        .map(subtask => ({ "title": subtask.title }))
                },
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )
        )
        .catch(err => alert(err.message))
        .finally(() => setFabIcon('pencil'))
    }

    return(
        !loading ?
        <ScrollView style={{flex: 1}}>
            <Card style={{marginTop: 20}}>
                <Card.Title
                    title={goal.task}
                    subtitle={goal.created_by}
                    left={props =>
                        <Avatar.Text {...props} label={goal.created_by.split(" ").map(str => str[0]).join("")}/>
                    }
                />
                <Card.Content>
                {
                    checked.length ?
                    checked.map((subtask, index) => 
                        <Checkbox.Item
                            key={index}
                            label={subtask.title}
                            status={subtask.is_subtask ? "checked" : "unchecked"}
                            onPress={() => {
                                let temp = [...checked]
                                temp[index].is_subtask = !temp[index].is_subtask
                                setChecked(temp)
                            }}
                        />
                    )
                    :
                    goal.subtasks.map((subtask, index) => 
                        <List.Item
                            key={index}
                            title={subtask.title}
                        />
                    )
                }
                <Button 
                    icon={checked.length > 0 ? 'minus' : 'plus'}
                    onPress={() => handleTaken(index)}
                    style = {{justifyContent: 'center', alignSelf: 'center', width: '90%', marginVertical: 10}}
                >
                    {checked.length > 0 ? 'Remove' : 'Follow'}
                </Button>
                <DT>
                    <DT.Header>
                        <DT.Title>Name</DT.Title>
                        <DT.Title>Progress</DT.Title>
                        {
                            goal.subtasks.map((subtask, index) =>
                                <DT.Title key={index}>T{index+1}</DT.Title>
                            )
                        }
                    </DT.Header>
                    {
                        goal.table.map((row, index) => 
                            <DT.Row key={index}>
                                <DT.Cell>{row.name}</DT.Cell>
                                <DT.Cell>{row.progress + '%'}</DT.Cell>
                                {
                                    row.table.map((innerRow, innerIndex) =>
                                        <DT.Cell key={innerIndex}>{
                                            innerRow.is_subtask ? 'Y' : 'N'
                                        }</DT.Cell>
                                    )
                                }
                            </DT.Row>
                        )
                    }
                </DT>
                </Card.Content>
            </Card>
            {
                checked.length > 0 &&
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
        </ScrollView>
        :
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator animating={true}/>
        </View>
    )
}