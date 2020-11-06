import {
    Avatar, Button, Card, CardActions, CardContent, CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel, Grid, IconButton, LinearProgress, makeStyles, Switch, TextField, Typography
} from '@material-ui/core'
import { blue, grey } from '@material-ui/core/colors'
import { Comment, Reply, ThumbUpAlt } from '@material-ui/icons'
import Axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCookie } from '../../../cookie/cookie'
import Post from './Post'

const useStyles = makeStyles(theme => ({
    scrollable: {
        [theme.breakpoints.up('sm')]: {
            height: 'calc(100vh - 72px)',
            overflow: 'auto',
            '&::-webkit-scrollbar': {
                display: 'none'
            }
        }
    }
}))

export default function Single() {

    const classes = useStyles()

    const [loading, setLoading] = useState(true)
    const [post, setPost] = useState({})
    const [comments, setComments] = useState([])
    const [cookie, setCookie] = useState(null)
    const [commentId, setCommentId] = useState(-1)
    const [comment, setComment] = useState('')
    const [is_anonymous, setIsAnonymous] = useState(false)
    const { enqueueSnackbar } = useSnackbar()

    const { id } = useParams()

    useEffect(() => {
        setCookie(getCookie("usertoken"))
    }, [])

    useEffect(() => {
        if (cookie)
            getPostAndComments()
    }, [cookie, id])

    const toggleComment = e => setCommentId(e.currentTarget.id)

    const getPostAndComments = () =>
        Axios.get(
            `http://localhost:8000/api/post/${id}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            }
        )
            .then(res => {
                setPost(res.data)
                return Axios.get(
                    `http://localhost:8000/api/post/comment/${id}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${cookie}`
                        }
                    }
                )
            })
            .then(res => {
                setComments(res.data)
                setLoading(false)
            })
            .catch(err => enqueueSnackbar(err.message, { variant: 'error' }))

    const submitComment = () => {
        let parent_id
        parent_id = commentId
        if (parent_id === -1)
            parent_id = null
        setCommentId(-1)
        Axios.post(
            `http://localhost:8000/api/post/comment/${id}/`,
            {
                parent_id,
                content: comment,
                is_anonymous
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            }
        )
            .then(getPostAndComments)
            .then(() => {
                enqueueSnackbar('Comment added successfully', { variant: 'success' })
            })
            .catch(err => {
                console.log(err)
                enqueueSnackbar(err.message + ". Couldn't add comment", { variant: 'error' })
            })
    }

    const toggleLike = () => {
        const action = post.is_liked ? 'unlike' : 'like'
        Axios.post(
            `http://localhost:8000/api/post/${action}/`,
            { id: post.id },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                }
            }
        )
            .then(res => {
                setPost({ ...post, is_liked: !post.is_liked })
                enqueueSnackbar(`${action}d`, { variant: 'success' })
            })
            .catch(err => {
                enqueueSnackbar(`Could not ${action}`, { variant: 'error' })
            })
    }

    const renderComments = (innerComment, nestedLevel) => {
        return (
            innerComment
                ?
                <div key={innerComment.id}>
                    <CardHeader
                        title={innerComment.content}
                        subheader={innerComment.is_anonymous ? 'Anonymous User' : innerComment.first_name + ' ' + innerComment.last_name}
                        action={
                            <IconButton id={innerComment.id} onClick={toggleComment}>
                                <Reply />
                            </IconButton>
                        }
                        style={{
                            marginLeft: `${nestedLevel * 5}%`,
                            borderLeft: `2px solid ${grey[500]}`,
                            width: 'inherit'
                        }}
                        titleTypographyProps={{
                            variant: 'body1'
                        }}
                        subheaderTypographyProps={{
                            variant: 'body2'
                        }}
                    />
                    {
                        innerComment.comment.map(val => renderComments(val, nestedLevel + 1))
                    }
                </div>
                :
                null
        )
    }

    return (
        loading ?
            <LinearProgress style={{ width: '100%' }} />
            :
            <>
                <Grid container item xs={12} md={8} className={classes.scrollable}>
                    <Grid item>
                        <Card>
                            <CardHeader
                                avatar={
                                    <Avatar>
                                        {
                                            post.is_anonymous ?
                                                'AU' :
                                                post.first_name[0] + post.last_name[0]
                                        }
                                    </Avatar>
                                }
                                title={post.is_anonymous ? 'Anonymous User' : `${post.first_name} ${post.last_name}`}
                                subheader={new Date(post.published_at).toLocaleString()}
                            />
                            <CardContent>
                                <Typography variant="h6">{post.title}</Typography>
                                <br />
                                <Typography paragraph variant="body2">
                                    {post.description}
                                </Typography>
                                <Typography color="primary">
                                    {post.tags.map((tag, index) =>
                                        <span key={index}> #{tag}</span>
                                    )}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <IconButton id={post.id} onClick={toggleLike}>
                                    <ThumbUpAlt
                                        style={{
                                            color: post.is_liked ? blue[600] : 'grey'
                                        }}
                                    />
                                </IconButton>
                                <IconButton id={0} onClick={toggleComment}>
                                    <Comment style={{ color: 'grey' }} />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item style={{ width: 'inherit' }}>
                        {
                            comments.length ?
                                <>
                                    <Typography variant="h6" paragraph style={{ marginTop: '8px' }}>Comments</Typography>
                                    {
                                        comments.map(val => renderComments(val, 0))
                                    }
                                </>
                                :
                                <Typography variant="body2" paragraph>Comment to interact with the community! :)</Typography>
                        }
                    </Grid>
                </Grid>
                <Grid container item xs={12} md={4} direction="column">
                    <Grid item>
                        <Card style={{ textAlign: 'center' }}>
                            <CardHeader
                                subheader='Some posts that you may like'
                            />
                        </Card>
                    </Grid>
                    <Grid item style={{ marginTop: 8 }}>
                        <Post data={post.post_list[0]} />
                    </Grid>
                    <Grid item style={{ marginTop: 8 }}>
                        <Post data={post.post_list[1]} />
                    </Grid>
                </Grid>
                <Dialog
                    open={commentId !== -1}
                    onClose={() => setCommentId(-1)}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="form-dialog-title">Comment</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="comment"
                            label="Your comment"
                            type="text"
                            fullWidth
                            autoFocus
                            variant="outlined"
                            onChange={e => setComment(e.target.value)}
                        />
                        <FormControlLabel
                            label="Anonymity"
                            style={{ marginTop: '8px' }}
                            control={
                                <Switch
                                    name="is_anonymous"
                                    onChange={e => setIsAnonymous(e.target.checked)}
                                />
                            }
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCommentId(-1)} color="secondary">
                            Cancel
                </Button>
                        <Button onClick={submitComment} color="primary">
                            Submit
                </Button>
                    </DialogActions>
                </Dialog>
            </>
    )
}