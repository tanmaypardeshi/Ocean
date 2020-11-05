import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { getCookie, getDetailsFromCookie } from "../../../cookie/cookie";
import Axios from "axios";
import {
  Grid,
  Card,
  CardHeader,
  Avatar,
  CardContent,
  Typography,
  CardActions,
  Paper,
  IconButton,
  CardMedia,
  CircularProgress,
  CardActionArea,
  makeStyles,
  Hidden,
  Toolbar,
  Drawer,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent, 
  TextField,
  Button
} from "@material-ui/core";
import { Skeleton, SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { ThumbUpAlt } from "@material-ui/icons";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import { blue } from "@material-ui/core/colors";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Link, useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  speedDial: {
    position: "fixed",
    "&.MuiSpeedDial-directionUp, &.MuiSpeedDial-directionLeft": {
      bottom: theme.spacing(5),
      right: theme.spacing(5),
    },
    "&.MuiSpeedDial-directionDown, &.MuiSpeedDial-directionRight": {
      top: theme.spacing(5),
      left: theme.spacing(5),
    },
  },
  drawer: {
    width: 400,
    flexShrink: 0,
  },
  drawerPaper: {
    width: 400,
  },
  drawerContainer: {
    overflow: "none",
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

export default function Communities() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [cookie, setCookie] = useState(null);
  const [mod, setMod] = useState(null);
  const [page, setPage] = useState(0);
  const [end, setEnd] = useState(false);
  const [posts, setPosts] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [postId, setPostId] = useState(-1);
  const [reason , setReason] = useState('');

  const actions = [
    { icon: <ChatBubbleIcon />, name: "Coral" },
    { icon: <CreateIcon />, name: "New Post" },
  ];

  const { tag } = useParams();


  useEffect(() => {
    setCookie(getCookie("usertoken"));
    setMod(getDetailsFromCookie("usertoken"));
  }, []);

  useEffect(() => {
    getPosts(1);
  }, [cookie, mod]);

  useEffect(() => {
    getMods();
  }, [cookie, mod]);

  const getMods = () => {
    Axios.get(`http://localhost:8000/api/user/getmoderators/${tag}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    }).then((response) => {
      setModerators(response.data.moderators);
    });
  };
  const getPosts = (page) => {
    if (cookie) {
      Axios.get(`http://localhost:8000/api/post/${tag}/${page}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie}`,
        },
      }).then((response) => {
        setPosts([...posts, ...response.data.post_list]);
        setEnd(response.data.post_list.length < 20);
        setPage(page);
      });
    }
  };

  const toggleLike = ({ currentTarget }) => {
    const index = currentTarget.id;
    const action = posts[index].is_liked ? "unlike" : "like";
    Axios.post(
      `http://localhost:8000/api/post/${action}/`,
      { id: posts[index].id },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie}`,
        },
      }
    )
      .then((res) => {
        const newPosts = [...posts];
        newPosts[index].is_liked = !posts[index].is_liked;
        setPosts(newPosts);
        enqueueSnackbar(`${action}d`, { variant: "success" });
      })
      .catch((err) => {
        enqueueSnackbar(`Could not ${action}`, { variant: "error" });
      });
  };

  const handleSubmit = () => {
      Axios.post(
          'http://localhost:8000/api/post/moderate/',
          {
              'id': postId,
              'reason': reason
          },
          {
            headers : {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookie}`
            }
          },
      ).then(res => {
          enqueueSnackbar(res.data.messaage, {variant:'success'})
          setPostId(-1);
      }).catch(err => {
          enqueueSnackbar(err.messaage, {variant:'error'})
      })
  }

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const togglePost = e => setPostId(e.currentTarget.id);

  return (
    <Grid container item spacing={1} direction="column">
      <Hidden mdDown>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper,
          }}
          anchor="right"
        >
          <Toolbar />
          <Typography variant="h5" style={{ margin: "4% 3% 0% 3%" }}>
            Moderators for this channel
          </Typography>
          {moderators.map((moderator, index) => (
            <Paper
              elevation={3}
              key={index}
              style={{ margin: "3% 4% 3% 4%", padding: "3%" }}
            >
              <Typography variant="body1">
                Moderator Name: {moderator.first_name} {moderator.last_name}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Moderator Email: {moderator.email}
              </Typography>
            </Paper>
          ))}
        </Drawer>
      </Hidden>
      <SpeedDial
        color="primary"
        ariaLabel="Coral Create"
        className={classes.speedDial}
        icon={<KeyboardArrowUpIcon />}
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={handleClose}
          />
        ))}
      </SpeedDial>
      {!!posts
        ? posts.map((post, index) => (
            <Grid item key={index}>
              <Card>
                <CardActionArea
                  component={Link}
                  to={(location) => `/home/feed/${post.id}`}
                >
                  <CardHeader
                    avatar={
                      <Avatar>
                        {post.is_anonymous
                          ? "AU"
                          : post.first_name[0] + post.last_name[0]}
                      </Avatar>
                    }
                    title={
                      post.is_anonymous
                        ? "Anonymous User"
                        : `${post.first_name} ${post.last_name}`
                    }
                    subheader={new Date(post.published_at).toLocaleString()}
                  />
                  <CardContent>
                    <Typography variant="h6">{post.title}</Typography>
                    <br />
                    <Typography paragraph variant="body2">
                      {post.description.split(" ").slice(0, 50).join(" ") +
                        "..."}
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
                  {
                      mod.is_moderator && mod.tags.includes(tag) ?
                        <IconButton id={post.id} onClick={() => setPostId(post.id)}>
                            <DeleteIcon />
                        </IconButton>
                    :
                    null
                  }
                    <Dialog
                    aria-labelledby="form-dialog-title"
                    open={postId !== -1}
                    onClose={() => setPostId(-1)}
                    fullWidth
                    >
                    <DialogTitle id="form-dialog-title">
                        Reason to delete post
                    </DialogTitle>
                        <DialogContent>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            label="Reason to delete post"
                            type="text"
                            autoComplete="Reason"
                            onChange={e => setReason(e.target.value)}
                            required
                            multiline
                            rows={4}
                            fullWidth
                        />
                        </DialogContent>
                        <DialogActions>
                        <Button autoFocus color="primary" onClick={()=> setPostId(-1)}>
                            CANCEL
                        </Button>
                        <Button color="primary" onClick={handleSubmit} type="submit">
                            EDIT
                        </Button>
                        </DialogActions>
                    </Dialog>
                </CardActions>
              </Card>
            </Grid>
          ))
        : [1, 1].map((v, i) => (
            <Grid item key={i}>
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
                  <Skeleton variant="h6" width="50%" />
                  <br />
                  <Skeleton variant="h1" width="100%" />
                  <br />
                  <Skeleton variant="h6" width="50%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="circle">
                    <Avatar />
                  </Skeleton>
                </CardActions>
              </Card>
            </Grid>
          ))}
      {!!posts &&
        (end ? (
          <Grid item>
            <Card>
              <CardMedia
                style={{ height: 300 }}
                image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
              />
              <CardContent style={{ textAlign: "center" }}>
                All done for now! Welcome to the bottom of Ocean!
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <Grid item>
            <ReactVisibilitySensor
              onChange={(visible) => {
                if (visible) getPosts(page + 1);
              }}
            >
              <Card>
                <CardContent style={{ textAlign: "center" }}>
                  <CircularProgress />
                </CardContent>
              </Card>
            </ReactVisibilitySensor>
          </Grid>
        ))}
    </Grid>
  );
}
