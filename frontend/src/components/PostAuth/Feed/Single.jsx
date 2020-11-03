import React, { useEffect, useState } from 'react';
import {useSnackbar} from 'notistack';
import Axios from 'axios';
import { Container, Typography, Card, CardHeader, IconButton, Avatar, CardContent,
    CardActions, Collapse, makeStyles } from '@material-ui/core';
import { ThumbUpAlt } from '@material-ui/icons';
import CommentIcon from '@material-ui/icons/Comment';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { blue } from '@material-ui/core/colors'
import clsx from 'clsx';
import { getCookie } from '../../../cookie/cookie';
import Post from './Post';

const useStyles = makeStyles(theme => ({
    root : {

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
    }
}));

const Single = () => {
    const classes = useStyles();
    const [comments, setComments] = useState([]);
    const [data, setData] = useState({
      "id": 0,
      "first_name": "",
      "last_name": "",
      "title": "",
      "description": "",
      "is_liked": false,
      "is_anonymous": false,
      "published_at": "",
      "tags": [],
      "post_list": []
    });
    const {enqueueSnackbar} = useSnackbar();
    const [expanded, setExpanded] = useState(false);
    const cookie = getCookie("usertoken");
   

    const handleLike = () => {
      const cookie = getCookie("usertoken");
      
      if(data.is_liked) {
        Axios.post(
          "http://localhost:8000/api/post/like/",
          {'id':data.id },
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
          {'id':data.id },
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

    const handleComment = () => {
      Axios.get(
        'http://localhost:8000/api/post/comment/23/',
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookie}`
          }
        }
      )
      .then(response => {
        setComments(response.data);
      })
      .catch(error => {
        console.log(error);
      })    
    }

    useEffect(() => {
      Axios.get(
        'http://localhost:8000/api/post/23',
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${cookie}`
          }
        }
      )
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.log(error);
      })
    }, [])

    return (
      data.description && 
       <Container className={classes.root}>
           <div>
             {comments}
           </div>
           <Card className={classes.root} key={data.id}>
                <CardHeader
                  avatar= {<Avatar aria-label="name" className={classes.avatar}>
                      {<Typography variant="h4">
                        {data.is_anonymous ? 'AU' : data.first_name.charAt(0)}{data.last_name.charAt(0)}
                      </Typography>}
                    </Avatar>}
                  title={<Typography variant="h4">{data.first_name} {data.last_name}</Typography>}
                  subheader={<Typography color="textSecondary" variant="h5">{new Date(data.published_at).toLocaleString()}</Typography>}
                />
                <CardContent>
                  <Typography variant="h4">{data.title}</Typography><br></br>
                  <Typography paragraph>
                    {data.description.split(" ").slice(0,50).join(" ") + '....'}
                  </Typography>
                  <Typography paragraph color="primary" variant="h6">
                    {data.tags.map(tag => {
                      return (
                        <span>{`#${tag} `}</span>
                      )
                    })}
                    </Typography>    
                </CardContent>
                <CardActions disableSpacing>
                  <IconButton aria-label="like" onClick = {handleLike} id = {data.id}>
                    <ThumbUpAlt style={{
                      color: data.is_liked ? blue[600] : 'grey'
                    }}/>
                  </IconButton>
                  <IconButton aria-label="like" onClick = {handleComment} id = {data.id}>
                    <CommentIcon style={{
                      color: 'grey'
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
                      {data.description}
                    </Typography>                
                  </CardContent>
                </Collapse>
              </Card>
              <br/>
              <Typography variant="h3">
                Other Posts which you might like
              </Typography>
              <Post data={data.post_list[0]} />
              <Post data={data.post_list[1]} />
       </Container>
    )
}

export default Single;