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
  Button,
  Tab,
  Tabs,
  Paper,
  makeStyles,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CardMedia,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  List,
  TextField,
  Input,
  Select,
  InputLabel,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
} from "@material-ui/core";
import { Delete, ThumbUpAlt } from "@material-ui/icons";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import CakeIcon from "@material-ui/icons/Cake";
import EditIcon from "@material-ui/icons/Edit";
import { blue } from "@material-ui/core/colors";
import Edit from "./Edit";
import Axios from "axios";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import tags from "../Tags";
import { getCookie } from "../../../cookie/cookie";
import { Skeleton } from "@material-ui/lab";
import ReactVisibilitySensor from "react-visibility-sensor";
import { dropMessages } from "react-chat-widget";

const useStyles = makeStyles((theme) => ({
  scrollable: {
    [theme.breakpoints.up("sm")]: {
      height: "calc(100vh - 104px)",
      overflow: "auto",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
  delete: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.text.primary,
    "&:hover": {
      backgroundColor: theme.palette.error.dark,
    },
  },
  chips: {
      display: 'flex',
      flexWrap: 'wrap',
  },
  chip: {
      margin: 2,
  },
  textInput: {
      marginTop: theme.spacing(2)
  }
}));

export default function Profile() {
  const classes = useStyles();
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

  const [postEnd, setPostEnd] = useState(false);
  const [likeEnd, setLikeEnd] = useState(false);
  const [commentEnd, setCommentEnd] = useState(false);

  const [value, setValue] = useState(0);
  const [chat, setChat] = useState(false);

  const [change, setChange] = useState(false);
  const [changeData, setChangeData] = useState({
    password: "",
    new_password: "",
    confpass: "",
  });

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

  const [ind, setInd] = useState(-1);
  const [editPost, setEditPost] = useState({
    id: -1,
    title: "",
    description: "",
    tags: "",
    is_anonymous: false,
  });
  const [selectedTags, setSelectedTags] = useState([]);

  const [deletePost, setDeletePost] = useState(-1);

  const [deleteComment, setDeleteComment] = useState(-1);

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
      getMyPosts(1);
    } else if (parseInt(newValue) === 1 && likeloading) {
      getMyLikes(1);
    } else if (parseInt(newValue) === 2 && commentloading) {
      getMyComments(1);
    }
  };

  const handleEdit = () => {
    setEdit(!edit);
  };

  const getMyPosts = (page) => {
    Axios.get(`http://localhost:8000/api/post/myposts/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
    .then((response) => {
      setPostPage(page);
      setMyPosts([...myPosts, ...response.data.post_list]);
      setPostLoading(false);
      if (response.data.post_list.length < 10) setPostEnd(true);
    })
    .catch((err) => {
      enqueueSnackbar("Could not fetch posts", { variant: "error" });
    });
  };

  const getMyLikes = (page) => {
    Axios.get(`http://localhost:8000/api/post/mylikes/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setLikePage(page);
        setMyLikes([...myLikes, ...response.data.like_list]);
        setLikeLoading(false);
        if (response.data.like_list.length < 10) setLikeEnd(true);
      })
      .catch((err) => {
        enqueueSnackbar("Could not fetch likes", { variant: "error" });
      });
  };

  const getMyComments = (page) => {
    Axios.get(`http://localhost:8000/api/post/mycomments/${page}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        setCommentPage(page);
        console.log(response.data.comment_list);
        setMyComments([...myComments, ...response.data.comment_list]);
        setCommentLoading(false);
        if (response.data.comment_list.length < 10) setCommentEnd(true);
      })
      .catch((err) => {
        enqueueSnackbar("Could not fetch comments", { variant: "error" });
      });
  };

  const handleDelete = () => {
    Axios.delete("http://localhost:8000/api/coral/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        setChat(!chat);
        dropMessages();
      })
      .catch((error) => {
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  const handleChangePassword = (event) => {
    const et = event.target;
    if (!!et.id) {
      setChangeData({ ...changeData, [et.id]: et.value });
    } else {
      setChangeData({ ...changeData, [et.name]: et.value });
    }
    if (event.target.id === "confpass") {
      if (changeData.password === event.target.value) {
        enqueueSnackbar("Passwords match!", { variant: "success" });
      }
    }
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();
    if (
      !changeData.password ||
      !changeData.new_password ||
      !changeData.confpass
    ) {
      enqueueSnackbar("All fields must be filled!", { variant: "error" });
      return;
    }
    if (changeData.new_password.length < 8) {
      enqueueSnackbar("Password Length should be 8 characters", {
        variant: "error",
      });
      return;
    }
    Axios.post("http://localhost:8000/api/user/change/", changeData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        enqueueSnackbar(response.data.message, { variant: "success" });
        setChange(!change);
      })
      .catch((error) => {
        enqueueSnackbar(error.message, { variant: "error" });
      });
  };

  const handleEditPostChange = (event) => {
      const et = event.target;
      if(et.name === 'title' || et.name === 'description') {
        setEditPost({...editPost, [et.name]: et.value})
      } else if(et.name === 'is_anonymous') {
        setEditPost({...editPost, [et.name]: !editPost.is_anonymous})
      }
  }
  const handleEditPost = () => {
    let final_tags = '';
    
    if (selectedTags.length === 0) {
      console.log(editPost)
      editPost.tags.map(tag => {
        final_tags += tag + ' ';
      })
    } else {
      selectedTags.map(tag => {
        final_tags += tag + ' '
      })
    }
    Axios.patch(
      'http://localhost:8000/api/post/wall/',
      {
        "id": editPost.id,
        "title": editPost.title,
        "description": editPost.description,
        "is_anonymous": editPost.is_anonymous,
        "tag": final_tags
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
        }
      }
    )
    .then(response => {
      setEditPost(-1);
      setInd(-1);
      getMyPosts(1);
      enqueueSnackbar(response.data.message, {variant: 'success'})
      
    })
    .catch(error => {
      enqueueSnackbar(error.message, {variant: 'error'})
    })
  }

  const handleDeletePost = () => {
    Axios.delete(
      `http://localhost:8000/api/post/${deletePost}/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
        }
      }
    )
    .then(response => {
      setDeletePost(-1)
      getMyPosts(1)
      enqueueSnackbar(response.data.message, {variant: 'success'})
    })
    .catch(error => {
      enqueueSnackbar(error.message, {variant: 'error'})
    })
  }

  const handleDeleteComment = () => {
    Axios.delete(
      `http://localhost:8000/api/post/comment/${deleteComment}/`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
        }
      }
    )
    .then(response => {
      setDeleteComment(-1)
      getMyComments(1)
      enqueueSnackbar(response.data.message, {variant: 'success'})
    })
    .catch(error => {
      enqueueSnackbar(error.message, {variant: 'error'})
    })
  }

  useEffect(() => {
    getMyPosts(1);

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

  return (
    <Grid container item spacing={1}>
      <Grid container item direction="column" xs={12} md={4} spacing={1}>
        <Grid item>
          <Card>
            <CardHeader
              title={user.first_name + " " + user.last_name}
              subheader={user.email}
              avatar={<Avatar>{user.first_name[0] + user.last_name[0]}</Avatar>}
              titleTypographyProps={{ variant: "h4" }}
              subheaderTypographyProps={{ variant: "h6" }}
            />
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <List dense>
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    <CakeIcon />
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
                    <LocationOnIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.country} secondary={user.gender} />
              </ListItem>
            </List>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader
              title={`${
                user.is_moderator ? "Moderating" : "Following"
              } communities`}
            />
            <List dense>
              {user.tags.map((tag, index) => (
                <ListItem key={index}>
                  <ListItemText primary={tag} />
                </ListItem>
              ))}
            </List>
          </Card>
        </Grid>
        <Grid item>
          <Button
            onClick={handleEdit}
            fullWidth
            variant="contained"
            color="primary"
          >
            Edit Profile
          </Button>
          {user.tags.length > 0 && (
            <Edit
              user={user}
              setUser={setUser}
              toggle={handleEdit}
              edit={edit}
            />
          )}
        </Grid>
        <Grid item>
          <Button
            onClick={() => setChange(!change)}
            fullWidth
            variant="contained"
            color="secondary"
          >
            Change Password
          </Button>
          <Dialog
            open={change}
            onClose={() => setChange(!change)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="change-password">Change Password</DialogTitle>
            <DialogContent>
              <TextField
                variant="outlined"
                margin="normal"
                id="password"
                label="Enter Password"
                type="password"
                autoComplete="Old Password"
                onChange={handleChangePassword}
                required
                fullWidth
              />
              <TextField
                variant="outlined"
                margin="normal"
                id="new_password"
                label="Enter New Password"
                type="password"
                autoComplete="New Password"
                onChange={handleChangePassword}
                required
                fullWidth
              />
              <TextField
                variant="outlined"
                margin="normal"
                id="confpass"
                label="Confirm New Password"
                type="password"
                autoComplete="New Password"
                onChange={handleChangePassword}
                required
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setChange(!change)} color="secondary">
                CANCEL
              </Button>
              <Button onClick={handlePasswordSubmit} color="primary" autoFocus>
                CHANGE
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
        <Grid item>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setChat(!chat)}
            className={classes.delete}
          >
            Delete Coral Chat history
          </Button>
          <Dialog
            open={chat}
            onClose={() => setChat(!chat)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Are you sure you want to delete the entire chat history with
              coral?
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setChat(!chat)} color="secondary">
                NO
              </Button>
              <Button onClick={handleDelete} color="primary" autoFocus>
                YES
              </Button>
            </DialogActions>
          </Dialog>
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
          {parseInt(value) === 0 ? (
            postloading ? (
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    avatar={
                      <Skeleton variant="circle">
                        <Avatar />
                      </Skeleton>
                    }
                    title={<Skeleton variant="text" width="80%" />}
                    subheader={<Skeleton variant="text" width="40%" />}
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
            ) : (
              <>
                {
                  deletePost !== -1 && (
                    <Dialog
                      fullWidth
                      open={deletePost.id !== -1}
                      onClose={() => setDeletePost(-1)}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        Are you sure you want to delete this post?
                      </DialogTitle>
                      <DialogActions>
                        <Button onClick={() => setDeletePost(-1)} color="secondary">
                          NO
                        </Button>
                        <Button onClick={handleDeletePost} color="primary" autoFocus>
                          YES
                        </Button>
                      </DialogActions>
                    </Dialog>
                  )    
                }
                {ind >= 0 && (
                  <Dialog
                    fullWidth
                    open={editPost.id !== -1}
                    onClose={() => setEditPost({ ...editPost, id: -1 })}
                  >
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogContent>
                      <TextField
                        autoFocus
                        variant="outlined"
                        name="title"
                        label="Title"
                        type="text"
                        defaultValue={myPosts[ind].title}
                        onChange={handleEditPostChange}
                        fullWidth
                      />
                      <TextField
                        variant="outlined"
                        name="description"
                        label="Description"
                        type="text"
                        defaultValue={myPosts[ind].description}
                        fullWidth
                        onChange={handleEditPostChange}
                        className={classes.textInput}
                        multiline
                      />
                      <InputLabel id="tag" className={classes.textInput}>
                        Tag communities
                      </InputLabel>
                      <Select
                        id="tag"
                        variant="outlined"
                        multiple
                        multiline
                        defaultValue={myPosts[ind].tags}
                        onChange={(e) => setSelectedTags(e.target.value)}
                        input={<Input id="select-multiple-chip" />}
                        fullWidth
                        renderValue={(selected) => (
                          <div className={classes.chips}>
                            {selected.map((value) => (
                              <Chip
                                key={value}
                                label={value}
                                className={classes.chip}
                              />
                            ))}
                          </div>
                        )}
                      >
                        {tags.map((name, index) => (
                          <MenuItem key={index} value={name}>
                            {name.split("_").join(" ")}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormControlLabel
                        label="Anonymity"
                        defaultValue={myPosts[ind].is_anonymous}
                        className={classes.textInput}
                        control={
                          <Switch
                            name="is_anonymous"
                            onChange={handleEditPostChange}
                          />
                        }
                      />
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => setEditPost({ ...editPost, id: -1 })}
                        color="secondary"
                      >
                        CANCEL
                      </Button>
                      <Button color="primary" onClick={handleEditPost}>EDIT</Button>
                    </DialogActions>
                  </Dialog>
                )}
                {myPosts.map((post, index) => (
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
                            {post.is_anonymous ?
                            '(Posted Anonymously)'
                            :
                            '(Not Posted Anonymously)'}

                            <br/>
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
                              color: post.is_liked ? blue[600] : "grey",
                            }}
                          />
                        </IconButton>
                        <IconButton
                          id={index}
                          onClick={() => {
                            setEditPost({ ...editPost, id: post.id, title:post.title, description: post.description, tags: post.tags });
                            setInd(index);
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          id={index}
                          onClick={() => {
                            setDeletePost(post.id);
                          }}  
                        >
                          <Delete />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  {postEnd && !postloading ? (
                    <Card>
                      <CardMedia
                        style={{ height: 300 }}
                        image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                      />
                      <CardContent style={{ textAlign: "center" }}>
                        All done for now! Welcome to the bottom of Ocean!
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <ReactVisibilitySensor
                        onChange={(visible) => {
                          if (visible) getMyPosts(postpage + 1);
                        }}
                      >
                        <CardHeader
                          avatar={
                            <Skeleton variant="circle">
                              <Avatar />
                            </Skeleton>
                          }
                          title={<Skeleton variant="text" width="80%" />}
                          subheader={<Skeleton variant="text" width="40%" />}
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
                  )}
                </Grid>
              </>
            )
          ) : parseInt(value) === 1 ? (
            likeloading ? (
              <Grid item xs={12}>
                <Card>
                  <CardHeader
                    avatar={
                      <Skeleton variant="circle">
                        <Avatar />
                      </Skeleton>
                    }
                    title={<Skeleton variant="text" width="80%" />}
                    subheader={<Skeleton variant="text" width="40%" />}
                  />
                  <CardActions>
                    <Skeleton variant="h6" width="25%" />
                  </CardActions>
                </Card>
              </Grid>
            ) : (
              <>
                {myLikes.map((like, index) => (
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
                          subheader={
                            like.is_anonymous ? "Anonymous User" : like.author
                          }
                        />
                      </CardActionArea>
                      <CardActions></CardActions>
                    </Card>
                  </Grid>
                ))}
                <Grid item xs={12}>
                  {likeEnd && !likeloading ? (
                    <Card>
                      <CardMedia
                        style={{ height: 300 }}
                        image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                      />
                      <CardContent style={{ textAlign: "center" }}>
                        All done for now! Welcome to the bottom of Ocean!
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <ReactVisibilitySensor
                        onChange={(visible) => {
                          if (visible) getMyLikes(likepage + 1);
                        }}
                      >
                        <CardHeader
                          avatar={
                            <Skeleton variant="circle">
                              <Avatar />
                            </Skeleton>
                          }
                          title={<Skeleton variant="text" width="80%" />}
                          subheader={<Skeleton variant="text" width="40%" />}
                        />
                      </ReactVisibilitySensor>
                      <CardActions>
                        <Skeleton variant="h6" width="25%" />
                      </CardActions>
                    </Card>
                  )}
                </Grid>
              </>
            )
          ) : commentloading ? (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  avatar={
                    <Skeleton variant="circle">
                      <Avatar />
                    </Skeleton>
                  }
                  title={<Skeleton variant="text" width="80%" />}
                  subheader={
                    <>
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="40%" />
                      <Skeleton variant="text" width="40%" />
                    </>
                  }
                />
                <CardActions>
                  <Skeleton variant="h6" width="25%" />
                </CardActions>
              </Card>
            </Grid>
          ) : (
            <>
                {
                  deleteComment !== -1 && (
                    <Dialog
                      fullWidth
                      open={deleteComment !== -1}
                      onClose={() => setDeletePost(-1)}
                      aria-labelledby="alert-dialog-title"
                      aria-describedby="alert-dialog-description"
                    >
                      <DialogTitle id="alert-dialog-title">
                        Are you sure you want to delete this comment?
                      </DialogTitle>
                      <DialogActions>
                        <Button onClick={() => setDeleteComment(-1)} color="secondary">
                          NO
                        </Button>
                        <Button onClick={handleDeleteComment}  color="primary" autoFocus>
                          YES
                        </Button>
                      </DialogActions>
                    </Dialog>
                  )    
                }
              {myComments.map((comment, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <CardActionArea
                      component={Link}
                      to={`/home/feed/${comment.post_id}`}
                    >
                      <CardHeader
                        avatar={
                          <Avatar>
                            {!comment.is_anonymous
                              ? comment.author.split(" ")[0].charAt(0) +
                                comment.author.split(" ")[1].charAt(0)
                              : "AU"}
                          </Avatar>
                        }
                        title={comment.content}
                        subheader={
                          <Typography variant="caption">
                            Posted Anonymously: {comment.is_anonymous ? 'Yes': 'No'}<br/>
                            Time:&nbsp;&nbsp;{" "}
                            {new Date(comment.published_at).toLocaleString()}
                            <br />
                            Post:&nbsp;&nbsp;&nbsp; {comment.post_title}
                            <br />
                            Author: {comment.author}
                          </Typography>
                        }
                      />
                    </CardActionArea>
                    <CardActions>
                      <IconButton
                        id={index}
                        onClick={() => setDeleteComment(comment.comment_id)}>
                        <Delete />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              <Grid item xs={12}>
                {commentEnd && !commentloading ? (
                  <Card>
                    <CardMedia
                      style={{ height: 300 }}
                      image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                    />
                    <CardContent style={{ textAlign: "center" }}>
                      All done for now! Welcome to the bottom of Ocean!
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <ReactVisibilitySensor
                      onChange={(visible) => {
                        if (visible) getMyComments(commentpage + 1);
                      }}
                    >
                      <CardHeader
                        avatar={
                          <Skeleton variant="circle">
                            <Avatar />
                          </Skeleton>
                        }
                        title={<Skeleton variant="text" width="80%" />}
                        subheader={
                          <>
                            <Skeleton variant="text" width="40%" />
                            <Skeleton variant="text" width="40%" />
                            <Skeleton variant="text" width="40%" />
                          </>
                        }
                      />
                    </ReactVisibilitySensor>
                    <CardActions>
                      <Skeleton variant="h6" width="25%" />
                    </CardActions>
                  </Card>
                )}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
}
