import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Card,
  CardHeader,
  IconButton,
  Avatar,
  CardContent,
  CardActions,
  CardActionArea,
  Hidden,
  Button,
  Tab,
  Tabs,
  Paper,
  makeStyles,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CardMedia,
} from "@material-ui/core";
import { Delete, LocalOffer, ThumbDownAlt, ThumbUpAlt, Wc } from "@material-ui/icons";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import CakeIcon from "@material-ui/icons/Cake";
import EditIcon from "@material-ui/icons/Edit"
import { blue, red } from "@material-ui/core/colors";
import Edit from './Edit'
import Axios from "axios";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";

import { getCookie } from "../../../cookie/cookie";
import { Skeleton } from "@material-ui/lab";
import ReactVisibilitySensor from "react-visibility-sensor";

const useStyles = makeStyles(theme => ({
  scrollable: {
    [theme.breakpoints.up('sm')]: {
        height: 'calc(100vh - 72px)',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
            display: 'none'
        }
    }
  },
  delete: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.error.dark
    },
  }
}))


export default function Profile() {
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar();
  const cookie = getCookie("usertoken");
  const [edit, setEdit] = useState(false);
  const [postpage, setPostPage] = useState(1);
  const [likepage, setLikePage] = useState(1);
  const [commentpage, setCommentPage] = useState(1);

  const [postloading, setPostLoading] = useState(true);
  const [commentloading, setCommentLoading] = useState(true);
  const [likeloading, setLikeLoading] = useState(true);

  const [myPosts, setMyPosts] = useState([]);
  const [myLikes, setMyLikes] = useState([]);
  const [myComments, setMyComments] = useState([]);

  const [postEnd, setPostEnd] = useState(false)
  const [likeEnd, setLikeEnd] = useState(false)
  const [commentEnd, setCommentEnd] = useState(false)

  const [value, setValue] = useState(0);

  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    dob: "",
    age: "",
    country: "",
    date_joined: "",
    last_login: "",
    is_moderator: false,
    gender: "",
    tags: [],
  });

  const toggleLike = ({ currentTarget }) => {
    const index = currentTarget.id;
    const action = myPosts[index].is_liked ? "unlike" : "like";
    Axios.post(
      `http://localhost:8000/api/post/${action}/`,
      { id: myPosts[index].id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie}`,
        },
      }
    )
      .then((res) => {
        const newPosts = [...myPosts];
        newPosts[index].is_liked = !myPosts[index].is_liked;
        setMyPosts(newPosts);
        enqueueSnackbar(`${action}d`, { variant: "success" });
      })
      .catch((err) => {
        enqueueSnackbar(`Could not ${action}`, { variant: "error" });
      });
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (parseInt(newValue) === 0 && postloading) {
      getMyPosts(1)
    } else if (parseInt(newValue) === 1 && likeloading) {
      getMyLikes(1)
    } else if (parseInt(newValue) === 2 && commentloading) {
      getMyComments(1)
    }
  };

  const handleEdit = () => {
    setEdit(!edit);
  };

  useEffect(() => {

    getMyPosts(1)

    Axios.get("http://localhost:8000/api/user/profile/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setUser(response.data.data);
      })
      .catch((error) => {
        enqueueSnackbar("Could not fetch profile", { variant: "error" });
      });

  }, []);


  const getMyPosts = (page) => {
    Axios.get(`http://localhost:8000/api/post/myposts/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setPostPage(page)
        setMyPosts([...myPosts, ...response.data.post_list]);
        setPostLoading(false);
        if (response.data.post_list.length < 10)
          setPostEnd(true)
      })
      .catch((err) => {
        enqueueSnackbar("Could not fetch posts", { variant: "error" });
      });
  }

  const getMyLikes = (page) => {
    Axios.get(`http://localhost:8000/api/post/mylikes/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setLikePage(page)
        setMyLikes([...myLikes, ...response.data.like_list]);
        setLikeLoading(false);
        if (response.data.like_list.length < 10)
          setLikeEnd(true)
      })
      .catch((err) => {
        enqueueSnackbar("Could not fetch likes", { variant: "error" });
      });
  }

  const getMyComments = (page) => {
    Axios.get(`http://localhost:8000/api/post/mycomments/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setCommentPage(page)
        setMyComments([...myComments, ...response.data.comment_list]);
        setCommentLoading(false);
        if (response.data.comment_list.length < 10)
          setCommentEnd(true)
      })
      .catch((err) => {
        enqueueSnackbar("Could not fetch comments", { variant: "error" });
      });
  }

  return (
    <Grid container item spacing={1}>
    <Grid container item direction="column" xs={12} md={4} spacing={1}>
    <Grid item>
      <Card>
        <CardHeader
          title={user.first_name + " " + user.last_name}
          subheader={user.email}
          avatar={
            <Avatar>
              {user.first_name[0] + user.last_name[0]}
            </Avatar>
          }
          titleTypographyProps={{variant: 'h4'}}
          subheaderTypographyProps={{variant: 'h6'}}
        />
      </Card>
    </Grid>
    <Grid item >
      <Card>
      <List dense>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <CakeIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={user.age + " years old"}
            secondary={user.dob}
          />
        </ListItem>
        <ListItem>
          <ListItemAvatar>
            <Avatar>
              <LocationOnIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={user.country}
            secondary={user.gender}
          />
        </ListItem>
      </List>
      </Card>
    </Grid>
    <Grid item>
      <Card>
        <CardHeader
          title={`${user.is_moderator ? 'Moderating' : 'Following'} communities`}
        />
        <List dense>
        {
          user.tags.map((tag, index) =>
            <ListItem key={index}>
              <ListItemText primary={tag}/>
            </ListItem>
          )
        }
        </List>
      </Card>
    </Grid>
    <Grid item>
      <Button onClick={handleEdit} fullWidth variant="contained" color="primary">
        Edit Profile
      </Button>
      {user.tags.length > 0 && <Edit user={user} setUser={setUser} toggle={handleEdit} edit={edit} /> }
    </Grid>
    <Grid item>
      <Button fullWidth variant="contained" className={classes.delete}>
        Delete Coral Chat history
      </Button>
    </Grid>
  </Grid>
  <Grid container item xs={12} md={8} direction="column" spacing={1}>
    <Grid item>
      <Paper style={{ width: "100%" }}>
        <Tabs
          variant="fullWidth"
          value={value}
          indicatorColor="primary"
          textColor="primary"
          onChange={handleChange}
          aria-label="disabled tabs example"
        >
          <Tab label="My Posts" />
          <Tab label="My Likes" />
          <Tab label="My Comments" />
        </Tabs>
      </Paper>
    </Grid>
    <Grid container item spacing={1} className={classes.scrollable}>
        {
        parseInt(value) === 0 ? 
            postloading ? 
              <Grid item xs={12}>
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
                    <Skeleton variant="h1" width="100%" />
                    <br />
                    <Skeleton variant="h6" width="50%" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
                </Card>
              </Grid>
             : 
             <>
             {
              myPosts.map((post, index) => 
              <Grid item key={index}>
                <Card>
                  <CardActionArea
                    component={Link}
                    to={`/home/feed/${post.id}`}
                  >
                    <CardHeader
                      avatar={
                        <Avatar>
                          {post.is_anonymous
                            ? "AU"
                            : post.first_name[0] + post.last_name[0]}
                        </Avatar>
                      }
                      title={post.title}
                      subheader={new Date(
                        post.published_at
                      ).toLocaleString()}
                    />
                    <CardContent>
                      <Typography paragraph variant="body2">
                        {post.description
                          .split(" ")
                          .slice(0, 50)
                          .join(" ") + "..."}
                      </Typography>
                      <Typography color="primary">
                        {post.tags.map((tag, index) => (
                          <span key={index}> #{tag}</span>
                        ))}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <IconButton id={index} onClick={toggleLike}>
                      <ThumbUpAlt
                          style={{
                              color: post.is_liked ? blue[600] : 'grey'
                          }}
                      />
                    </IconButton>
                    <IconButton>
                      <EditIcon/>
                    </IconButton>
                    <IconButton>
                      <Delete/>
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            )
            }
            <Grid item xs={12}>
            {
              postEnd && !postloading?
              <Card>
                      <CardMedia
                          style={{ height: 300 }}
                          image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                      />
                      <CardContent style={{ textAlign: 'center' }}>
                          All done for now! Welcome to the bottom of Ocean!
              </CardContent>
                  </Card>
              :
              <Card>
                <ReactVisibilitySensor onChange={visible => {
                  if (visible) getMyPosts(postpage + 1)
                }}>
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
                  </ReactVisibilitySensor>
                  <CardContent>
                    <Skeleton variant="h1" width="100%" />
                    <br />
                    <Skeleton variant="h6" width="50%" />
                  </CardContent>
                  <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
                </Card>
            }
            </Grid>
            </>
         : 
         parseInt(value) === 1 ? 
          likeloading ? 
          <Grid item xs={12}>
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
              <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
            </Card>
          </Grid>
             : 
             <>
             {
              myLikes.map((like, index) => 
              <Grid item xs={12} key={index}>
                    <Card>
                      <CardActionArea
                        component={Link}
                        to={`/home/feed/${like.post_id}`}
                      >
                        <CardHeader
                          avatar={
                            <Avatar>
                              {like.is_anonymous
                                ? "AU"
                                : like.author.split(" ")[0].charAt(0) +
                                  like.author.split(" ")[1].charAt(0)}
                            </Avatar>
                          }
                          title={like.post_title}
                          subheader={like.is_anonymous ? "Anonymous User" : like.author}
                        />
                      </CardActionArea>
                      <CardActions>
                      <IconButton>
                        <ThumbDownAlt/>
                      </IconButton>
                    </CardActions>
                    </Card>
                  </Grid>
                )
                }
                <Grid item xs={12}>
                {
                 likeEnd && !likeloading?
                 <Card>
                 <CardMedia
                     style={{ height: 300 }}
                     image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                 />
                 <CardContent style={{ textAlign: 'center' }}>
                     All done for now! Welcome to the bottom of Ocean!
         </CardContent>
             </Card>
             :
             <Card>
               <ReactVisibilitySensor onChange={visible => {
                  if (visible) getMyLikes(likepage + 1)
                }}>
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
              </ReactVisibilitySensor>
              <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
            </Card>
                }
                </Grid>
                </>
         : 
          commentloading ? 
          <Grid item xs={12}>
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
                    <>
                    <Skeleton variant="text" width="40%"/>
                    <Skeleton variant="text" width="40%"/>
                    <Skeleton variant="text" width="40%"/>
                    </>
                  }
                />
                <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
              </Card>
            </Grid>
             : 
             <>
             {
              myComments.map((comment, index) => 
              <Grid item xs={12} key={index}>
                    <Card>
                      <CardActionArea
                        component={Link}
                        to={`/home/feed/${comment.post_id}`}
                      >
                        <CardHeader
                          avatar={
                            <Avatar>
                              {
                              !comment.is_anonymous 
                              ?
                              comment.author.split(" ")[0].charAt(0) + comment.author.split(" ")[1].charAt(0)
                              :
                              "AU"
                              }
                            </Avatar>
                          }
                          title={comment.content}
                          subheader={
                            <Typography variant="caption">
                                Time:&nbsp;&nbsp; {new Date(comment.published_at).toLocaleString()}
                                <br/>
                                Post:&nbsp;&nbsp;&nbsp; {comment.post_title}
                                <br/>
                                Author: {comment.author}
                            </Typography>
                          }
                        />
                      </CardActionArea>
                      <CardActions>
                        <IconButton>
                          <EditIcon/>
                        </IconButton>
                        <IconButton>
                          <Delete/>
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                )
                }
                <Grid item xs={12}>
                {
                  commentEnd && !commentloading ?
                  <Card>
                  <CardMedia
                      style={{ height: 300 }}
                      image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                  />
                  <CardContent style={{ textAlign: 'center' }}>
                      All done for now! Welcome to the bottom of Ocean!
          </CardContent>
              </Card>
              :
              <Card>
                <ReactVisibilitySensor onChange={visible => {
                  if (visible) getMyComments(commentpage + 1)
                }}>
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
                    <>
                    <Skeleton variant="text" width="40%"/>
                    <Skeleton variant="text" width="40%"/>
                    <Skeleton variant="text" width="40%"/>
                    </>
                  }
                />
                </ReactVisibilitySensor>
                <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
              </Card>
                }
                </Grid>
                </>
        }
        </Grid>
    </Grid>
    </Grid>
  );
}
