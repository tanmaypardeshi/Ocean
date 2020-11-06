import * as React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, TextInput, Button, Caption, Chip, Switch, List } from 'react-native-paper';
import { getItemAsync } from 'expo-secure-store';
import Axios from 'axios';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';
import { useFocusEffect } from '@react-navigation/native';

export default ({navigation, route}) => {

    const [title, setTitle] = React.useState(route.params.title);
    const [description, setDescription] = React.useState(route.params.description);
    const [is_anonymous, set_is_anonymous] = React.useState(route.params.is_anonymous);
    const [patch, setPatch] = React.useState(!!route.params.id)
    const [tags, setTags] = React.useState({
        productivity: false,
        self_help: false,
        self_improvement : false,
        personal_development: false,
        spirituality: false,
        motivation: false,
        positivity: false,
        career: false,
        discipline: false,
        relationships:false,
        success: false,
        depression: false,
        anxiety: false,
        ptsd: false,
        alcohol: false,
        internet_addiction: false,
        bipolar_disorder: false,
        social_anxiety_disorder: false,
        stress: false,
        sleep_disorder: false,
        empathy_deficit_disorder:false 
    })

    useFocusEffect(React.useCallback(() => {
        setTitle(route.params.title)
        setDescription(route.params.description)
        set_is_anonymous(route.params.is_anonymous)
        if (route.params.tag.length) {
            let newTags = {...tags}
            newTags[route.params.tag] = true
            setTags(newTags)
        }
    },[]))

    const createPost = () => {
        getItemAsync("token")
        .then(token => {
            if (!title.length)
                throw new Error("Title can't be empty")
            if (!description.length)
                throw new Error("Description can't be empty")
            const tag = selectedTags().slice(1)
            if (tag.length < 4)
                throw new Error('Select atleast 1 tag')
            let data = {
                title,
                description,
                tag,
                is_anonymous
            }
            console.log(data)
            if (patch)
                data = {...data, id: route.params.id}   
            return Axios({
                method: patch ? 'patch' : 'post',
                url: `${SERVER_URI}/post/wall/`,
                data,
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            }) 
        })
        .then(res => {
            navigation.goBack()
        })
        .catch(err => {
            console.log(err)
            alert(err.message)
        })
    }

    const handlePersonalityChange = (target, value) => {
        const tT = {...tags}
        tT[target] = value
        setTags(tT)
    }

    const selectedTags = () => {
        let strTags = ""
        Object.getOwnPropertyNames(tags).filter(tag => tags[tag]).forEach((value, index) => strTags += " " + value)
        return strTags
    }

    const formattedTags = () => {
        return selectedTags().split(" ").map(str => str.split('_').join(' ')).join(", ").slice(1)
    }

    return(
        <ScrollView>
        <Card style={{marginTop: 10}}>
            <TextInput
                value={title}
                placeholder='Tap on the title or description to edit'
                multiline
                onChangeText={setTitle}
                underlineColor='none'
                theme={{ colors: {primary: 'transparent'} }}
                style={{
                    backgroundColor: 'none',
                    fontSize: 20
                }}
            />
            <TextInput
                value={description}
                placeholder='Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'
                multiline
                onChangeText={setDescription}
                underlineColor='none'
                theme={{ colors: {primary: 'transparent'} }}
                style={{
                    backgroundColor: 'none'
                }}
            />
            <Card.Content>
                <Caption>
                    {
                        "Tags:" + formattedTags()
                    }
                </Caption>
            </Card.Content>
        </Card>
        <List.Item
            title="Anonymity"
            description="Show/Hide your information in your post"
            right={props => <Switch style={props.style} value={is_anonymous} onValueChange={set_is_anonymous}/>}
        />
        <Button 
            mode='contained'
            style={styles.button}
            onPress={createPost}
        >
            CREATE
        </Button>
        <Caption style={styles.captionTag}>Select relevant tags</Caption>
        <View style={styles.personalityView}>
        {
            Object.getOwnPropertyNames(tags).map((item, index) =>
                <Chip
                    key={index}
                    selected={tags[item]}
                    style={{margin:10}}
                    onPress={() => handlePersonalityChange(item, !tags[item])}
                >
                    {item.split('_').join(' ')}
                </Chip>
            )
        }
        </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    button: {
        justifyContent: 'center', 
        alignSelf: 'center', 
        width: '90%', 
        height: 50,
        marginTop: 15
    },
    personalityView: {
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginHorizontal: 10
    },
    captionTag: {
        alignSelf: 'center', 
        marginVertical: 10
    }
})