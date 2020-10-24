import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Title, Card, Paragraph, IconButton, Avatar, Caption, useTheme, ActivityIndicator } from 'react-native-paper';
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
                    subtitle={innerComment.first_name + ' ' + innerComment.last_name}
                    right={props => <IconButton {...props} icon='dots-vertical'/>}
                />
            {
                innerComment.comment.map(val => renderComments(val, nestedLevel+1))
            }
            </React.Fragment>
            :
            null
        )
    }

    return(
        Object.keys(postDetails).length > 0 &&
        <ScrollView style={{flex: 1}}>
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
                            right={props => <IconButton {...props} icon='dots-vertical'/>}
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
        </ScrollView>
    )
}