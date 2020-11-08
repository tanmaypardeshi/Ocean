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
  IconButton,
  CardMedia,
  CardActionArea,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
  Button
} from "@material-ui/core";
import { Skeleton} from "@material-ui/lab";
import { ThumbUpAlt } from "@material-ui/icons";
import DeleteIcon from "@material-ui/icons/Delete";
import { blue } from "@material-ui/core/colors";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Link, useParams } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  scrollable: {
    [theme.breakpoints.up('sm')]: {
      height: 'calc(100vh - 104px)',
      overflow: 'auto',
      '&::-webkit-scrollbar': {
        display: 'none'
      }
    }
  }
}));

export default function Communities() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [cookie, setCookie] = useState(null);
  const [mod, setMod] = useState(null);
  const [page, setPage] = useState(0);
  const [end, setEnd] = useState(false);
  const [posts, setPosts] = useState([]);
  const [moderators, setModerators] = useState([]);
  const [postId, setPostId] = useState(-1);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true)

  const { tag } = useParams();


  useEffect(() => {
    setCookie(getCookie("usertoken"));
    setMod(getDetailsFromCookie("usertoken"));
  }, []);

  useEffect(() => {
    if (cookie !== null && mod !== null) {
      getPosts(1);
      getMods();
    }
  }, [cookie, mod, tag]);

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
        if (page === 1)
          setPosts(response.data.post_list)
        else
          setPosts([...posts, ...response.data.post_list]);
        setEnd(response.data.post_list.length < 10);
        setPage(page);
        setLoading(false)
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
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookie}`
        }
      },
    ).then(res => {
      enqueueSnackbar(res.data.messaage, { variant: 'success' })
      setPostId(-1);
    }).catch(err => {
      enqueueSnackbar(err.messaage, { variant: 'error' })
    })
  }

  return (
    <>
      <Grid container item xs={12} md={8} spacing={1} className={classes.scrollable}>
        {
          !loading
          ? 
          posts.map((post, index) => (
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
                </CardActions>
              </Card>
            </Grid>
          ))
          : 
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
          }
        <Grid item xs={12}>
        {
        !!posts && !loading &&
        (
          end 
          ? 
          <Card>
            <CardMedia
              style={{ height: 300 }}
              image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
            />
            <CardContent style={{ textAlign: "center" }}>
              All done for now! Welcome to the bottom of Ocean!
          </CardContent>
          </Card>
          : 
          <Card>
            <ReactVisibilitySensor onChange={visible => {
              if (visible)
                getPosts(page + 1)
            }}>
              <CardHeader
                avatar={
                  <Skeleton variant="circle">
                    <Avatar />
                  </Skeleton>
                }
                title={
                  <Skeleton variant="text" width="80%" />
                }
                subheader={
                  <Skeleton variant="text" width="40%" />
                }
              />

            </ReactVisibilitySensor>
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
        )
        }
        </Grid>
      </Grid>
      <Grid container item xs={12} md={4} direction="column" spacing={1}>
        <Grid item>
          <Card style={{textAlign: 'center'}}>
            <CardHeader
              subheader='Moderators for this community'
            />
            <CardContent>
              You can contact moderators if needed
            </CardContent>
          </Card>
        </Grid>
        {
          moderators.map((moderator, index) => 
            <Grid item key={index}>
              <Card>
                <CardHeader
                  title={moderator.first_name + " " + moderator.last_name}
                  subheader={moderator.email}
                />
              </Card>
            </Grid>
          )
        }
      </Grid>
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
          <Button autoFocus color="primary" onClick={() => setPostId(-1)}>
            CANCEL
        </Button>
          <Button color="primary" onClick={handleSubmit} type="submit">
            EDIT
        </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
