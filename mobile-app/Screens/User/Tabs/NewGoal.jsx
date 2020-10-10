import * as React from 'react'
import { getItemAsync } from 'expo-secure-store'
import { ScrollView, StyleSheet } from 'react-native'
import { TextInput, Divider, Button, FAB } from 'react-native-paper'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'

const styles = StyleSheet.create({
    inputStyle: {
        width: '90%',
        alignSelf: 'center',
        marginTop: 15
    },
})

const defaultTask = {
    "title": ''
}

export default ({ navigation }) => {
    
    const [task, setTask] = React.useState('')
    const [subTasks, setSubTasks] = React.useState([defaultTask])

    const handleSubmit = () => {
        getItemAsync('token')
        .then(token => Axios.post(
            `${SERVER_URI}/cheer/gettasks`,
            {
                task,
                subTasks
            },
            {
                headers: {
                    ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                }
            }
        ))
        .then(res => {
            navigation.goBack()
        })
        .catch(err => alert(err.message))
    }

    return(
        <>
        <ScrollView style={{flex: 1}}>
            <TextInput
                value={task}
                style={styles.inputStyle}
                label='Name'
                placeholder='Enter an inspiring goal'
                onChangeText={setTask}
            />
            <Divider/>
            {
                subTasks.map((value, index) => {
                    <TextInput
                        key={index}
                        value={value.title}
                        style={styles.inputStyle}
                        label={`Task ${index+1}`}
                        placeholder='A stepping stone to your goal'
                        onChangeText={subTaskTitle => {
                            let temp = [...subTasks]
                            temp[index].title = subTaskTitle
                            setSubTasks(temp)
                        }}
                    />
                })
            }
            <Button
                style = {{justifyContent: 'center', alignSelf: 'center', width: '90%', height: 50}}
                onPress={() => {
                    let temp = [...subTasks]
                    temp.push(defaultTask)
                    setSubTasks(temp)
                }}
            >
                Add Task
            </Button>
        </ScrollView>
        <FAB
            icon='plus'
            onPress={handleSubmit}
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