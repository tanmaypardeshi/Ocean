import * as React from 'react'
import { useTheme, IconButton, Colors, Portal, Dialog, List } from 'react-native-paper'
import { GiftedChat, InputToolbar, Composer, Bubble, Time } from 'react-native-gifted-chat'
import { v4 as uuidv4 } from 'uuid'
import { useIsFocused, useFocusEffect } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { getItemAsync } from 'expo-secure-store'
import Axios from 'axios'
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network'
import { Alert, ScrollView } from 'react-native'
import { isAvailableAsync, composeAsync } from 'expo-mail-composer'

const Stack = createStackNavigator()

const Coral = ({ navigation, del }) => {
    
    const [messages, setMessages] = React.useState([])
    const [moderatorList, setModeratorList] = React.useState([])
    const [showModerators, setShowModerators] = React.useState(false)

    const toggleModerators = () => setShowModerators(!showModerators)

    const theme = useTheme()


    React.useEffect(() => {
        if (del && messages.length > 0)
            handleDelete()
    },[del])

    useFocusEffect(React.useCallback(() => {
        if (messages.length === 0) {
            getMessages()
        }
    },[]))

    const handleDelete = () => 
        getItemAsync("token")
        .then(token => 
            Axios.delete(
                `${SERVER_URI}/coral/`,
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )    
        )
        .then(res => setMessages([]))
        .catch(err => alert(err.message))
        .finally(() => console.log('handleDelete called'))

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
            let responseMsgs = [res.data.chat]
            if (res.data.is_popup) {
                setModeratorList(res.data.moderator_list)
                responseMsgs.unshift({
                    "_id": uuidv4(),
                    "createdAt": new Date().toISOString(),
                    "text": "You can always long press this message to communicate with our moderators!",
                    "user": {
                        "_id": 2
                    }
                })
            }
            setMessages(previousMessages => GiftedChat.append(previousMessages, responseMsgs))
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
        <>
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{
                _id: 1,
            }}
            renderAvatar={null}
            onLongPress={(context, message) => {
                if (message.text.includes('moderators')) {
                    toggleModerators()
                }
            }}
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
                        backgroundColor: 
                        props.currentMessage.text.includes('ERROR') ? Colors.redA400 : 
                        props.currentMessage.text.includes('moderators') ? Colors.green500 : theme.colors.disabled 
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
        <Portal>
            <Dialog
                visible={showModerators}
                onDismiss={toggleModerators}
            >
                <Dialog.Title>Moderator list</Dialog.Title>
                <Dialog.ScrollArea>
                    <ScrollView>
                    {
                        moderatorList.map((v,i) =>
                            <List.Item
                                key={i}
                                title={v.name}
                                description={v.email}
                                onPress={() => {
                                    isAvailableAsync()
                                    .then(available => {
                                        if (available)
                                            return composeAsync({
                                                recipients: [v.email]
                                            })
                                        else
                                            throw new Error('Mailing service not available')
                                    })
                                    .then(response => alert(response.status))
                                    .catch(err => alert(err.message))
                                }}
                            />
                        )
                    }
                </ScrollView>
                </Dialog.ScrollArea>
            </Dialog>
        </Portal>
        </>
    )
}

export default ({ navigation }) => {

    const [del, setDel] = React.useState(false);

    return(
        <Stack.Navigator>
            <Stack.Screen
                name="Chat"
                // component={Coral}
                options={{
                    title: 'Coral',
                    headerLeft: () => <IconButton icon='menu' onPress={() => navigation.toggleDrawer()}/>,
                    //headerRight: () => <IconButton icon='delete' onPress={() => setDel(del+1)}/>
                    headerRight: () => <IconButton icon='delete' onPress={() => {
                        Alert.alert(
                            "Delete chat history?", 
                            "Your complete chat history with Coral will be deleted. Proceed?",
                            [
                                {
                                    text: 'Cancel',
                                    style: 'cancel',
                                    onPress: () => {}
                                },
                                {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => {
                                        setDel(true)
                                        setDel(false)
                                    }
                                }
                            ]    
                        )
                    }}/>
                }}
            >
                {props => <Coral {...props} del={del}/>}
            </Stack.Screen>
        </Stack.Navigator>
    )
}