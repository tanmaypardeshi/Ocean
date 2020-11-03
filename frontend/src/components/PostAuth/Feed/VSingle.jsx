import { Avatar, Card, CardActions, CardContent, CardHeader, Container, Drawer, Grid, Hidden, IconButton, LinearProgress, makeStyles, Toolbar, Typography } from '@material-ui/core'
import { blue } from '@material-ui/core/colors'
import { ThumbUpAlt } from '@material-ui/icons'
import Axios from 'axios'
import { useSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getCookie } from '../../../cookie/cookie'
import Post from './Post'

const useStyles = makeStyles(theme => ({
    drawer: {
        width: 400,
        flexShrink: 0
    },
    drawerPaper: {
        width: 400
    },
    drawerContainer: {
        overflow: 'none'
    },
    container: {
        flexGrow: 1,
        padding: theme.spacing(3)
    }
}))

export default function Single() {

    const classes = useStyles()

    const [loading, setLoading] = useState(true)
    const [post, setPost] = useState({})
    const [comments, setComments] = useState([])
    const [cookie, setCookie] = useState(null)

    const { enqueueSnackbar } = useSnackbar()

    const { id } = useParams()

    useEffect(() => {
        setCookie(getCookie("usertoken"))
    },[])

    useEffect(() => {
        if (cookie)
            getPostAndComments()
    },[cookie, id])

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
            console.log(res.data)
            setComments(res.data)
            setLoading(false)
        })
        .catch(err => enqueueSnackbar(err.message, { variant: 'error' }))

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
            setPost({...post, is_liked: !post.is_liked})
            enqueueSnackbar(`${action}d`, { variant: 'success'})
        })
        .catch(err => {
            enqueueSnackbar(`Could not ${action}`, { variant: 'error' })
        })
    }

    return(
        loading ?
        <LinearProgress style={{width: '100%'}}/>
        :
        <>
        <Grid container item >
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
                    title={post.first_name + post.last_name}
                    subheader={new Date(post.published_at).toLocaleString()}
                />
                <CardContent>
                    <Typography variant="h6">{post.title}</Typography>
                    <br/>
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
                            color: post.is_liked ? blue[600]: 'grey'
                        }}
                    />
                </IconButton>
                </CardActions>
            </Card>
        </Grid>
        <Hidden mdDown>
        <Drawer
            className={classes.drawer}
            variant="permanent"
            classes={{
                paper: classes.drawerPaper
            }}
            anchor="right"
        >
            <Toolbar/>
            <Post data={post.post_list[0]}/>
            <Post data={post.post_list[1]}/>
        </Drawer>
        </Hidden>
        </>
    )
}