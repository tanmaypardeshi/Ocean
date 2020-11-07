import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { getCookie } from "../../../cookie/cookie";
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
  Button,
  Dialog,
  DialogTitle,
  TextField,
  Select,
  Input,
  Chip,
  MenuItem,
  DialogContent,
  FormControlLabel,
  Switch,
  DialogActions,
  InputLabel,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { ThumbUpAlt } from "@material-ui/icons";
import { blue } from "@material-ui/core/colors";
import ReactVisibilitySensor from "react-visibility-sensor";
import { Link } from "react-router-dom";
import tags from "../Tags";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
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
  scrollable: {
    [theme.breakpoints.up("sm")]: {
      height: "calc(100vh - 72px)",
      overflow: "auto",
      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  },
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
  textInput: {
    marginTop: theme.spacing(2),
  },
}));

export default function VFeed() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [cookie, setCookie] = useState(null);
  const [page, setPage] = useState(0);
  const [end, setEnd] = useState(false);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState({
    title: "",
    description: "",
    tag: "",
    is_anonymous: false,
  });

  const [selectedTags, setSelectedTags] = useState([]);

  const toggleOpen = () => setOpen(!open);

  const handleChange = (e) =>
    !!e.target.name
      ? setPost({ ...post, [e.target.name]: e.target.checked })
      : setPost({ ...post, [e.target.id]: e.target.value });

  useEffect(() => {
    setCookie(getCookie("usertoken"));
  }, []);

  useEffect(() => {
    if (cookie) {
      getPosts(1);
      getProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookie]);

  const handleSubmit = () => {
    let data = { ...post };
    selectedTags.forEach((tag) => {
      data.tag = data.tag += tag + " ";
    });
    console.log(data);
    Axios.post(`http://localhost:8000/api/post/wall/`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cookie}`,
      },
    })
      .then((response) => {
        enqueueSnackbar("Post created successfully", { variant: "success" });
      })
      .catch((err) => {
        enqueueSnackbar(err.message + ". Couldn't create post", {
          variant: "error",
        });
      });
  };

  const getProfile = () =>
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

  const getPosts = (page) => {
    if (cookie) {
      Axios.get(`http://localhost:8000/api/post/wall/${page}/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie}`,
        },
      })
        .then((response) => {
          setPosts([...posts, ...response.data.post_list]);
          setEnd(response.data.post_list.length < 20);
          setPage(page);
        })
        .catch((err) => enqueueSnackbar(err.message, { variant: "error" }));
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

  return (
    <>
      <Grid container item xs={12} md={8} className={classes.scrollable}>
        {!!posts &&
          posts.map((post, index) => (
            <Grid item key={index} style={{ marginTop: "8px" }}>
              <Card>
                <CardActionArea
                  component={Link}
                  to={(location) => `${location.pathname}/${post.id}`}
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
                </CardActions>
              </Card>
            </Grid>
          ))}
        <Grid xs={12} style={{ marginTop: "8px" }}>
          {!!posts &&
            (end ? (
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
                    if (visible) getPosts(page + 1);
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
            ))}
        </Grid>
      </Grid>
      {user && (
        <Grid container item xs={12} md={4} direction="column" spacing={1}>
          <Grid item>
            <Card style={{ marginTop: "8px" }}>
              <CardContent style={{ textAlign: "center" }}>
                {/* <Avatar style={{alignSelf: 'center'}}>
                            {user.first_name[0] + user.last_name[0]}
                        </Avatar> */}
                <Typography variant="h6">
                  {user.first_name + " " + user.last_name}
                </Typography>
                <Typography paragraph>{user.country}</Typography>
                <Typography paragraph>
                  {user.gender + ", " + user.dob}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Button variant="contained" fullWidth onClick={toggleOpen}>
              Add Post
            </Button>
          </Grid>
        </Grid>
      )}
      <Dialog open={open} onClose={toggleOpen}>
        <DialogTitle>New Post</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            variant="outlined"
            id="title"
            label="Title"
            type="text"
            fullWidth
            onChange={handleChange}
          />
          <TextField
            variant="outlined"
            id="description"
            label="Description"
            type="text"
            fullWidth
            onChange={handleChange}
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
            value={selectedTags}
            onChange={(e) => setSelectedTags(e.target.value)}
            input={<Input id="select-multiple-chip" />}
            fullWidth
            renderValue={(selected) => (
              <div className={classes.chips}>
                {selected.map((value) => (
                  <Chip key={value} label={value} className={classes.chip} />
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
            className={classes.textInput}
            control={<Switch name="is_anonymous" onChange={handleChange} />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={toggleOpen} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
