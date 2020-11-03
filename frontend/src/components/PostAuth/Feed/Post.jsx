import React, { useState } from 'react'
import { makeStyles } from '@material-ui/styles'
import { Typography, Card, CardHeader, IconButton, Avatar, CardContent,
          CardActions, Collapse } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { blue } from '@material-ui/core/colors'
import clsx from 'clsx';


const useStyles = makeStyles(theme => ({
    root: {
        marginTop : '2%'
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

const Post = ({data}) => {
    const classes=useStyles();
    const [expanded, setExpanded] = useState(false);

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    return (
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
    )
}

export default Post;