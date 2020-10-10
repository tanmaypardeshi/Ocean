import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Title, Card, Paragraph, IconButton, Avatar, Caption } from 'react-native-paper';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import Axios from 'axios';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';
import { v4 as uuidv4 } from 'uuid'

const styles = StyleSheet.create({
    cardStyle: {
        marginTop: 10
    }
})

export default ({navigation, route}) => {

    const [postDetails, getPostDetails] = React.useState(route.params.item);
    const [comments, setComments] = React.useState([]);
    const theme = useTheme();

    useFocusEffect(React.useCallback(() => {
        SecureStore.getItemAsync("token")
        .then(token => 
            Axios.get(`${SERVER_URI}/post/comment/${route.params.item.id}/`, {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            })
        )
        .then(res => {
            console.log(res.data);
            setComments(res.data);
        })
        .catch(err => alert(err.message))
    },[]))

    const renderComments = (innerComment, nestedLevel) => {
        return(
            innerComment
            ? 
            <React.Fragment key={uuidv4()}>
                <Paragraph style={{marginLeft: `${nestedLevel*5}%`}}>{innerComment.content}</Paragraph>
                <Caption style={{marginLeft: `${nestedLevel*5}%`}}>{innerComment.first_name}</Caption>
            {
                innerComment.comment.map(val => renderComments(val, nestedLevel+1))
            }
            </React.Fragment>
            :
            null
        )
    }

    return(
        <ScrollView style={{flex: 1, paddingTop: 20}}>
            <Card style={styles.cardStyle}>
                <Card.Title
                    title={postDetails.first_name + " " + postDetails.last_name}
                    subtitle={new Date(postDetails.published_at).toLocaleString()}
                    left={props => <Avatar.Text {...props} label={postDetails.first_name[0]+postDetails.last_name[0]}/>}
                    right={props => <IconButton {...props} icon='dots-vertical'/>}
                />
                <Card.Content>
                    <Title>{postDetails.title}</Title>
                    <Paragraph>{postDetails.description}</Paragraph>
                </Card.Content>
                <Card.Actions style={{justifyContent: 'space-around'}}>
                    <IconButton icon='thumb-up' color={postDetails.is_liked ? theme.colors.primary : theme.colors.text}/>
                    <IconButton icon='comment'/>
                    <IconButton icon='share-variant'/>
                </Card.Actions>
            </Card>
            {
                comments.length !== 0 &&
                comments.map(val => (
                    renderComments(val, 0)
                ))
            }
        </ScrollView>
    )
}