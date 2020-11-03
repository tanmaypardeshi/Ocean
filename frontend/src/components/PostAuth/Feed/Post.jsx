import React from 'react'
import { Typography, Card, CardHeader, Avatar, CardContent, makeStyles, CardActionArea } from '@material-ui/core';
import { Link } from 'react-router-dom';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(2),
    boxShadow: 'none'
  }
}))

const Post = ({ data }) => {

  const navigate = location => {
    const locarr = location.pathname.split('/')
    locarr.pop()
    locarr.push(data.id)
    return locarr.join('/')
  }

  return (
    <Card key={data.id} className={useStyles().root}>
      <CardActionArea component={Link} to={navigate}>
        <CardHeader
          avatar={
            <Avatar>
              {data.is_anonymous ? 'AU' : data.first_name.charAt(0)}{data.last_name.charAt(0)}
            </Avatar>
          }
          title={data.first_name + " " + data.last_name}
          subheader={new Date(data.published_at).toLocaleString()}
        />
        <CardContent>
          <Typography variant="h6">{data.title}</Typography><br />
          {/* <Typography paragraph>
            {data.description.split(" ").slice(0,50).join(" ") + '....'}
          </Typography> */}
          <Typography paragraph color="primary" variant="body2">
            {
              data.tags.map((tag, index) =>
                <span key={index}> #{tag}</span>
              )
            }
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default Post;