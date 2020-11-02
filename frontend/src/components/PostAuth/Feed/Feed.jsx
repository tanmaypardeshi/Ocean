import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Container, Typography, Card, CardHeader, IconButton, Avatar, CardContent,
          CardActions, Collapse, CircularProgress } from '@material-ui/core';
import { ThumbUpAlt } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { blue } from '@material-ui/core/colors'
import clsx from 'clsx';
import Axios from 'axios';
import VisibilitySensor from 'react-visibility-sensor';

import { useSnackbar } from 'notistack';
import {getCookie} from '../../../cookie/cookie';

const useStyles = makeStyles(theme => ({
  container : {
    overflowY: 'scroll'
  },
  root: {
    marginBottom : '2%'
  },
  avatar : {
    height:'70px',
    width:'70px',
    backgroundColor: blue[600]
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
  progress: {
    marginLeft: '50%'
}
}))

export default function Feed() {
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar()
    const cookie = getCookie("usertoken");
    const [expanded, setExpanded] = useState(false);
    const [page, setPage] = useState(1);
    const [posts, setPosts] = useState([]);

    const getPosts = () => {
      setPage(page+1);
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
        setPosts(response.data.post_list);
      })
      .catch(err => {
        console.log(err);
      })
    }
    const handleLike = (event) => {
      const index = event.currentTarget.id;    
      const newPosts = [...posts];
      newPosts.filter(function(post) {
        if(post.id === parseInt(index)) {
          post.is_liked = !post.is_liked
        }
      });
      setPosts(newPosts);
      const post = posts.find(post => post.id === parseInt(index));
      const cookie = getCookie("usertoken");
      
      if(post.is_liked) {
        Axios.post(
          "http://localhost:8000/api/post/like/",
          {'id':post.id },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookie}`
            }
          }
        )
        .then(res => {
          enqueueSnackbar('Added to Likes!', { variant: 'success'});
        })
        .catch(err => {
          enqueueSnackbar('Could not add to likes', {variant: 'error'})
        })
      } else {
        Axios.post(
          "http://localhost:8000/api/post/unlike/",
          {'id':post.id },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookie}`
            }
          }
        )
        .then(res => {
          enqueueSnackbar('Unliked post!', { variant: 'success'});
        })
        .catch(err => {
          enqueueSnackbar('Could not unlike', {variant: 'error'})
        })
      }
    };

    const handleExpandClick = () => {
      setExpanded(!expanded);
    };

    useEffect(() => {
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
        setPosts(response.data.post_list);
      })
      .catch(err => {
        console.log(err);
      })
    }, [])
  
    return(
      <Container className={classes.container}>
        {
          posts.map(post => {
            return (
              <Card className={classes.root} key={post.id}>
                <CardHeader
                  avatar= {<Avatar aria-label="name" className={classes.avatar}>
                      {<Typography variant="h4">
                        {post.is_anonymous ? 'AU' : post.first_name.charAt(0)}{post.last_name.charAt(0)}
                      </Typography>}
                    </Avatar>}
                  title={<Typography variant="h4">{post.first_name} {post.last_name}</Typography>}
                  subheader={<Typography color="textSecondary" variant="h5">{new Date(post.published_at).toLocaleString()}</Typography>}
                />
                <CardContent>
                  <Typography variant="h4">{post.title}</Typography><br></br>
                  <Typography paragraph>
                    {post.description.split(" ").slice(0,50).join(" ") + '....'}
                  </Typography>
                  <Typography paragraph color="primary" variant="h6">
                    {post.tags.map(tag => {
                      return (
                        <span>{`#${tag} `}</span>
                      )
                    })}
                    </Typography>    
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton aria-label="like" onClick = {handleLike} id = {post.id}>
                    <ThumbUpAlt style={{
                      color: post.is_liked ? blue[600] : 'grey'
                    }}/>
                  </IconButton>
                  <IconButton
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: expanded,
                    })}
                    onClick={handleExpandClick}
                    aria-expanded={expanded}
                    aria-label="show more"
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardActions>
                <Collapse in={expanded} timeout="auto" unmountOnExit>
                  <CardContent>
                    <Typography paragraph>
                      {post.description}
                    </Typography>                
                  </CardContent>
                </Collapse>
              </Card>
            )
          })
        }
        {
            !posts.length ? 
                <div className={classes.noNewPost}>
                    <Typography variant="h3">All done for now! You are at the bottom of the ocean.</Typography>
                </div> :
                <VisibilitySensor onChange={getPosts}>
                    <Card className={classes.card}>
                        <CardContent>
                            <CircularProgress className={classes.progress}/>
                        </CardContent>
                    </Card>
                </VisibilitySensor>
        }
      </Container>
    )
}