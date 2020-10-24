import * as React from 'react'
import { useTheme, IconButton, Colors } from 'react-native-paper'
import { GiftedChat, InputToolbar, Composer, Bubble, Time } from 'react-native-gifted-chat'
import { v4 as uuidv4 } from 'uuid'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { getItemAsync } from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'

const Stack = createStackNavigator()

const Coral = ({ navigation }) => {
    const [messages, setMessages] = React.useState([])
    const theme = useTheme()

    useFocusEffect(React.useCallback(() => {
        if (!messages.length)
            getMessages()
    },[]))

    const getMessages = () => {
        getItemAsync('token')
        .then(token => 
            Axios.get(
                `${SERVER_URI}/coral/`,
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => {
            setMessages(res.data.chats)
        })
        .catch(err => alert(err.message))
    }

    const onSend = React.useCallback((messages = []) => {
        setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
        getItemAsync('token')
        .then(token => 
            Axios.post(
                `${SERVER_URI}/coral/`,
                messages[0],
                {
                    headers: {
                        ...AXIOS_HEADERS, "Authorization": `Bearer ${token}`
                    }
                }
            )
        )
        .then(res => {
            setMessages(previousMessages => GiftedChat.append(previousMessages, [res.data]))
        })
        .catch(err => {
            setMessages(previousMessages => GiftedChat.append(previousMessages, [{
                "_id": uuidv4(),
                "createdAt": new Date().toISOString(),
                "text": "ERROR: " + err.message,
                "user": {
                    "_id": 2,
                }
            }]))
        })

    }, [])

    return(
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: 1,
            }}
            renderAvatar={() => null}
            renderInputToolbar={
                props => 
                <InputToolbar 
                    {...props} 
                    containerStyle={{
                        backgroundColor: theme.colors.background
                    }}
                />}
            renderComposer={
                props =>
                <Composer
                    {...props}
                    placeholder='Type a message'
                    placeholderTextColor={theme.colors.disabled}
                    textInputStyle={{
                        color: theme.colors.text
                    }}
                />
            }
            renderBubble={
                props => 
                <Bubble 
                    {...props} 
                    wrapperStyle={{ left:{ 
                        backgroundColor: !props.currentMessage.text.includes('ERROR') ? theme.colors.disabled : Colors.redA400
                    }}}
                    textStyle={{ left: { color: theme.colors.text } }}
                />
            }
            renderTime={
                props =>
                <Time
                    {...props}
                    timeTextStyle={{ left: { color: theme.colors.text } }}
                />
            }
        />
    )
}

export default ({ navigation }) => {
    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Chat"
                component={Coral}
                options={{
                    title: 'Coral',
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>
                }}
            />
        </Stack.Navigator>
    )
}