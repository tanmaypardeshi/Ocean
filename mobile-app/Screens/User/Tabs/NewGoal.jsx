import * as React from 'react'
import { getItemAsync } from 'expo-secure-store'
import { ScrollView, StyleSheet } from 'react-native'
import { TextInput, Divider, Button, FAB, Colors } from 'react-native-paper'
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
    const [subTasks, setSubTasks] = React.useState([{...defaultTask}])

    const handleSubmit = () => 
        getItemAsync('token')
        .then(token => Axios.post(
            `${SERVER_URI}/cheer/posttask/`,
            {
                task,
                subtasks: subTasks
            },
            {
                headers: {
                    ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                }
            }
        ))
        .then(res => {
            alert('Task added successfully')
            navigation.goBack()
        })
        .catch(err => alert(err.message))
    

    return(
        <ScrollView style={{flex: 1}}>
            <TextInput
                value={task}
                style={styles.inputStyle}
                label='Name'
                placeholder='Enter an inspiring goal'
                onChangeText={setTask}
                multiline
                mode="outlined"
            />
            {
                subTasks.map((value, index) => 
                    <TextInput
                        key={index}
                        value={value.title}
                        style={styles.inputStyle}
                        mode="outlined"
                        label={`Subtask ${index+1}`}
                        placeholder='A stepping stone to your goal'
                        onChangeText={subTaskTitle => {
                            let temp = [...subTasks]
                            temp[index].title = subTaskTitle
                            setSubTasks(temp)
                        }}
                    />
                )
            }
            <Button
                style = {{justifyContent: 'center', alignSelf: 'center', width: '90%', height: 50, marginTop: 15}}
                onPress={() => setSubTasks([...subTasks, {...defaultTask}])}
                mode="contained"
                color={Colors.teal500}
            >
                Add Subtask
            </Button>
            <Button
                style = {{justifyContent: 'center', alignSelf: 'center', width: '90%', height: 50, marginTop: 15}}
                onPress={handleSubmit}
                mode="contained"
            >
                Submit
            </Button>
        </ScrollView>
    )
}