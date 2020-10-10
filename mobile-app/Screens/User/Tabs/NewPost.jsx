import * as React from 'react'
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';

export default ({navigation}) => {

    const [title, setTitle] = React.useState('');
    const [desc, setDesc] = React.useState('');

    return(
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <TextInput
                value={title}
                label='Title'
                placeholder='Enter a catchy title'
                onChangeText={newTitle => setTitle(newTitle)}
                style={styles.textInput}
            />
            <TextInput
                value={desc}
                label='Description'
                placeholder='Enter something relevant to your title'
                onChangeText={newDesc => setDesc(newDesc)}
                style={styles.textInput}
            />
            <Button 
                mode='contained'
                style={styles.button}
            >
                CREATE
            </Button>
        </View>
    )
}

const styles = StyleSheet.create({
    textInput: {
        width: '90%',
        marginTop: 15
    },
    button: {
        justifyContent: 'center', 
        alignSelf: 'center', 
        width: '90%', 
        height: 50
    }
})