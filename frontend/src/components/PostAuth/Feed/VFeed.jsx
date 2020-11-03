import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'
import { getCookie } from '../../../cookie/cookie'
import Axios from 'axios'
import { Grid, Card, CardHeader, Avatar, CardContent, Typography, CardActions, IconButton, CardMedia, CircularProgress, CardActionArea } from '@material-ui/core'
import { ThumbUpAlt } from '@material-ui/icons'
import { blue } from '@material-ui/core/colors'
import { Skeleton } from '@material-ui/lab'
import ReactVisibilitySensor from 'react-visibility-sensor'
import { Link } from 'react-router-dom'

export default function VFeed() {
    const { enqueueSnackbar } = useSnackbar()
    const [cookie, setCookie] = useState(null)
    const [page, setPage] = useState(0)
    const [end, setEnd] = useState(false)
    const [posts, setPosts] = useState([])

    useEffect(() => {
        setCookie(getCookie("usertoken"))
    },[])

    useEffect(() => {
        getPosts(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[cookie])

    const getPosts = (page) => {
        if (cookie) {
            Axios.get(
                `http://localhost:8000/api/post/wall/${page}/`,
                {
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                    }
                }
            )
            .then(response => {
                setPosts([...posts, ...response.data.post_list])
                setEnd(response.data.post_list.length < 20)
                setPage(page)
            })
            .catch(err => enqueueSnackbar(err.message, { variant: 'error'}))
        }
    }

    const toggleLike = ({ currentTarget }) => {
        const index = currentTarget.id
        const action = posts[index].is_liked ? 'unlike' : 'like'
        Axios.post(
            `http://localhost:8000/api/post/${action}/`,
            { id: posts[index].id },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                  }
            }
        )
        .then(res => {
            const newPosts = [...posts]
            newPosts[index].is_liked = !posts[index].is_liked
            setPosts(newPosts)
            enqueueSnackbar(`${action}d`, { variant: 'success'})
        })
        .catch(err => {
            enqueueSnackbar(`Could not ${action}`, { variant: 'error' })
        })
    }

    return(
        <Grid container item spacing={1} direction="column">
        {
            !!posts 
            ?
            posts.map((post, index) =>
                <Grid item key={index}>
                    <Card>
                        <CardActionArea component={Link} to={location => `${location.pathname}/${post.id}`}>
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
                            <br/>
                            <Typography paragraph variant="body2">
                                {post.description.split(" ").slice(0, 50).join(" ") + "..."}
                            </Typography>
                            <Typography color="primary">
                            {post.tags.map((tag, index) => 
                                <span key={index}> #{tag}</span>
                            )}
                            </Typography>
                        </CardContent>
                        </CardActionArea>
                        <CardActions>
                            <IconButton id={index} onClick={toggleLike}>
                                <ThumbUpAlt
                                    style={{
                                        color: post.is_liked ? blue[600]: 'grey'
                                    }}
                                />
                            </IconButton>
                        </CardActions>
                    </Card>
                </Grid>
            )
            : 
            [1,1].map((v,i) =>
                <Grid item key={i}>
                    <Card>
                        <CardHeader
                            avatar={
                                <Skeleton variant="circle">
                                    <Avatar/>
                                </Skeleton>
                            }
                            title={
                                <Skeleton variant="text" width="80%"/>
                            }
                            subheader={
                                <Skeleton variant="text" width="40%"/>
                            }
                        />
                        <CardContent>
                            <Skeleton variant="h6" width="50%"/>
                            <br/>
                            <Skeleton variant="h1" width="100%"/>
                            <br/>
                            <Skeleton variant="h6" width="50%"/>
                        </CardContent>
                        <CardActions>
                            <Skeleton variant="circle">
                                <Avatar/>
                            </Skeleton>
                        </CardActions>
                    </Card>
                </Grid>
            )
        }
        {
            !!posts &&
            (
                end ?
                <Grid item>
                    <Card>
                        <CardMedia
                            style={{height: 300}}
                            image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                        />
                        <CardContent style={{textAlign: 'center'}}>
                            All done for now! Welcome to the bottom of Ocean!
                        </CardContent>
                    </Card>
                </Grid>
                :
                <Grid item>
                    <ReactVisibilitySensor onChange={visible => {
                        if (visible)
                            getPosts(page+1)
                    }}>
                        <Card>
                            <CardContent style={{textAlign: 'center'}}>
                                <CircularProgress/>
                            </CardContent>
                        </Card>
                    </ReactVisibilitySensor>
                </Grid>
            )
        }
        </Grid>
    )

}