import React, { useEffect, useState } from 'react';
import {useSnackbar} from 'notistack';
import Axios from 'axios';
import { Container, Typography, Card, CardHeader, IconButton, Avatar, CardContent,
    CardActions, Collapse, makeStyles } from '@material-ui/core';
import { ThumbUpAlt } from '@material-ui/icons';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { blue } from '@material-ui/core/colors'
import clsx from 'clsx';
import { getCookie } from '../../../cookie/cookie';

const useStyles = makeStyles({
    root : {

    }
});

const Single = () => {
    const classes = useStyles();
    const [data, setData] = useState();
    const {enqueueSnackbar} = useSnackbar();
    const [expanded, setExpanded] = useState(false);
    const cookie = getCookie("usertoken");
   

    const handleLike = (event) => {
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

    useEffect(() => {
        Axios.get(
            'http://localhost:8000/api/post/23/',
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                }
            }
        )
        .then(response => {
            console.log(response.data)
            setData(response.data);
        })
        .catch(err => {
            enqueueSnackbar('Could not Fetch Post', {variant: 'error'})
        })
    }, []);

    return (
       <Container className={classes.root}>
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
       </Container>
    )
}

export default Single;