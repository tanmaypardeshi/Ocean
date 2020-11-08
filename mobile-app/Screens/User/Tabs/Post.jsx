import * as React from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { Title, Card, Paragraph, IconButton, Avatar, Caption, useTheme, ActivityIndicator, Button, Portal, Dialog, TextInput, List, Switch } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import Axios from 'axios';
import { SERVER_URI, AXIOS_HEADERS } from '../../../Constants/Network';
import { v4 as uuidv4 } from 'uuid'

const styles = StyleSheet.create({
    cardStyle: {
        marginVertical: 10
    }
})

export default ({navigation, route}) => {

    const [postDetails, setPostDetails] = React.useState({});
    const [comments, setComments] = React.useState([]);
    const [loading, setLoading] = React.useState(true)
    const [showDialog, setShowDialog] = React.useState(-1)
    const [comment, setComment] = React.useState('')
    const [is_anonymous, set_is_anonymous] = React.useState(false)
    const theme = useTheme();

    useFocusEffect(React.useCallback(() => {
        if (!comments.length)
            getPostsAndComments()
    },[]))

    const getPostsAndComments = async() => {
        try {
            setLoading(true)
            const token = await SecureStore.getItemAsync("token")
            const postData = await Axios.get(
                `${SERVER_URI}/post/${route.params.item.id}/`, {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            })
            const commentData = await Axios.get(
                `${SERVER_URI}/post/comment/${route.params.item.id}/`, {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            })
            setPostDetails(postData.data);
            setComments(commentData.data);
        } 
        catch (error) {
            alert(error.message)
        }
        finally {
            setLoading(false);
        }
    }

    const handleLike = () => {
        SecureStore.getItemAsync('token')
        .then(token => {
            let uri = "like"
            if (postDetails.is_liked){
                uri = "unlike"
            }
            return Axios.post(
                `${SERVER_URI}/post/${uri}/`,
                { "id": route.params.item.id },
                { headers: {...AXIOS_HEADERS, "Authorization": `Bearer ${token}`} }
            )    
        })
        .then(res => {
            let pd = {...postDetails}
            pd.is_liked = !pd.is_liked
            setPostDetails(pd)
        })
        .catch(err => alert(err.message))
    }

    const renderComments = (innerComment, nestedLevel) => {
        return(
            innerComment
            ? 
            <React.Fragment key={uuidv4()}>
                <Card.Title
                    title={innerComment.content}
                    titleStyle={{fontSize:12}}
                    titleNumberOfLines={10}
                    style={{
                        marginLeft: `${nestedLevel*5}%`,
                        borderLeftColor: theme.colors.disabled,
                        borderLeftWidth: 2
                    }}
                    subtitle={innerComment.is_anonymous ? 'Anonymous User' : innerComment.first_name + ' ' + innerComment.last_name}
                    right={
                        props => 
                        <IconButton 
                            {...props} 
                            icon='reply' 
                            onPress={() => setShowDialog(innerComment.id)}
                        />
                    }
                />
            {
                innerComment.comment.map(val => renderComments(val, nestedLevel+1))
            }
            </React.Fragment>
            :
            null
        )
    }

    const sendComment = async () => {
        try {
            const token = await SecureStore.getItemAsync("token")
            const postComment = await Axios.post(
                `${SERVER_URI}/post/comment/${postDetails.id}/`,
                {
                    parent_id: showDialog === 0 ? null : showDialog,
                    content: comment,
                    is_anonymous
                },
                {
                    headers: {
                        ...AXIOS_HEADERS,
                        "Authorization": `Bearer ${token}`
                    }
                }
            )
            const getComments = await Axios.get(
                `${SERVER_URI}/post/comment/${route.params.item.id}/`, {
                headers: {
                    ...AXIOS_HEADERS,
                    "Authorization": `Bearer ${token}`
                }
            })
            setComments(getComments.data)
            setComment('')
            setShowDialog(-1)    
        }
        catch (e) {
            alert(e.message)
        }
    }

    return(
        Object.keys(postDetails).length > 0 &&
        <ScrollView style={{flex: 1}}>
            <Card style={styles.cardStyle}>
                <Card.Title
                    title={postDetails.first_name + " " + postDetails.last_name}
                    subtitle={new Date(postDetails.published_at).toLocaleString()}
                    left={props => <Avatar.Text {...props} label={postDetails.first_name[0]+postDetails.last_name[0]}/>}
                />
                <Card.Content>
                    <Title>{postDetails.title}</Title>
                    <Paragraph>{postDetails.description}</Paragraph>
                </Card.Content>
                <Card.Actions style={{justifyContent: 'space-around'}}>
                    <Button
                        icon='thumb-up'
                        onPress={handleLike}
                        color={postDetails.is_liked ? theme.colors.primary : theme.colors.text}
                        children={postDetails.is_liked ? 'Liked' : 'Like'}
                    />
                    <Button
                        icon='comment'
                        children='Comment'
                        color={theme.colors.text}
                        onPress={() => setShowDialog(0)}
                    />
                    <Button
                        icon='share-variant'
                        children='Share'
                        color={theme.colors.text}
                    />
                </Card.Actions>
            </Card>
            <Caption>Other posts that you may like</Caption>
            {
                postDetails.post_list.map((value, index) =>
                    <Card 
                        key={index}
                        style={styles.cardStyle}
                        onPress={() => navigation.push('Post', {item: {...value, post_id: value.id}})}
                    >
                        <Card.Title
                            title={`${value.first_name} ${value.last_name}`}
                            subtitle={value.title}
                            left={props => <Avatar.Text {...props} label={value.first_name[0]+value.last_name[0]}/>}
                            subtitleNumberOfLines={3}
                        />
                    </Card>
                )
            }
            {
                loading 
                ?
                <ActivityIndicator animating={true}/>
                :
                comments.length
                ?
                <>
                <Caption>Comments</Caption>
                {
                    comments.map(val => (
                        renderComments(val, 0)
                    ))
                }
                </>
                :
                <Caption>Comment to interact with the community! :)</Caption>
            }
            <Portal>
                <Dialog
                    visible={showDialog >= 0}
                    onDismiss={() => setShowDialog(-1)}
                >
                    <Dialog.Title>Comment</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            type='flat'
                            style={{ backgroundColor: 'transparent' }}
                            onChangeText={setComment}
                        />
                        <List.Item
                            title="Anonymity"
                            right={props => <Switch style={props.style} value={is_anonymous} onValueChange={set_is_anonymous}/>}
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            onPress={() => setShowDialog(-1)}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={comment.length === 0}
                            onPress={sendComment}
                        >
                            Comment
                        </Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </ScrollView>
    )
}