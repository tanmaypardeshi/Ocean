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
  Paper,
  Tabs,
  Tab
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
  const [value, setValue] = useState(0);
 
  const [page, setPage] = useState(1);
  const [end, setEnd] = useState(false);
  const [loading, setLoading] = useState(true);

  const [follow, setFollow] = useState(-1);

  const [tasks, setTasks] = useState([]);
  const [mytasks, setMyTasks] = useState([]);
  const [task, setTask] = useState({"task": ""});
  const [subtasks, setSubTasks] = useState([
    {
      "title": ""
    }
  ])
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [post, setPost] = useState({
    title: "",
    description: "",
    tag: "",
    is_anonymous: false,
  });

  const toggleOpen = () => setOpen(!open);

  const removeSubtasks = () => {
    const newSubTasks = [...subtasks];
    newSubTasks.pop();
    setSubTasks(newSubTasks);
  }

  const addSubtasks = () => {
    setSubTasks([...subtasks, {"title": ""}]);
  }

  const handleChange = (e) => {
    const eti = e.target.id;
    const etv = e.target.value;
    if(eti === 'task') {
      setTask({...task, task: etv});
    } else {
      const newSubTasks = [...subtasks];
      newSubTasks[eti] = {"title": etv}
      setSubTasks(newSubTasks);
    }

  }

  useEffect(() => {
    setCookie(getCookie("usertoken"));
  }, []);

  useEffect(() => {
    if (cookie) {
      getTasks(1);
      getProfile();

    }
  }, [cookie]);


  const handleTab = (event, newValue) => {
    setValue(newValue);
    if (parseInt(newValue) === 0) {
      getMyTasks(1);
      
    } else if (parseInt(newValue) === 1) {
      getMyTasks(1);
    }
  }

  const handleSubmit = () => {
    Axios.post(
      'http://localhost:8000/api/cheer/posttask/',
      {
        "task": task.task,
        "subtasks": subtasks
      },
      {
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cookie}`,
        }
      }
    )
    .then(response => {
        enqueueSnackbar(response.data.message, {variant: 'success'});
        setOpen(!open);
    })
    .catch(err => {
        enqueueSnackbar(err.message, {variant: 'error'})
    })
  };

  const getProfile = () =>
    Axios.get("http://localhost:8000/api/user/profile/", 
    {
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

  const getTasks = (page) => {
    Axios.get(
      `http://localhost:8000/api/cheer/gettasks/${page}/`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookie}`
        }
      }
    )
    .then(response => {
      setTasks(response.data.post_list);
    })
    .catch(error => {
      enqueueSnackbar('Could not fetch tasks', {variant: 'error'});
    })
  }

  const getMyTasks = () => {
    Axios.get(
      `http://localhost:8000/api/cheer/mytasks/`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookie}`
        }
      }
    )
    .then(response => {
      setMyTasks(response.data.post_list);
    })
    .catch(error => {
      enqueueSnackbar('Could not fetch tasks', {variant: 'error'});
    })
  }

  
  const handleFollow = () => {
    Axios.post(
      `http://localhost:8000/api/cheer/follow/`,
      {
        'id': follow
      },
      {
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${cookie}`
        }
      }
    )
    .then(res => {
      enqueueSnackbar(res.data.message, {variant: 'success'});
      setFollow(-1);
    })
    .catch(err => {
      enqueueSnackbar(err.message, {variant: 'error'})
    })
  }


  return (
    <>
      {
        follow !== -1 && (
          <Dialog
            fullWidth
            open={follow !== -1}
            onClose={() => setFollow(-1)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Are you sure you want to delete this post?
            </DialogTitle>
            <DialogActions>
              <Button onClick={() => setFollow(-1)} color="secondary">
                NO
              </Button>
              <Button onClick={handleFollow} color="primary" autoFocus>
                YES
              </Button>
            </DialogActions>
          </Dialog>
        )    
      }

      <Grid container item xs={12} md={8} className={classes.scrollable}>
          <Paper style={{ width: "100%" }}>
            <Tabs
              variant="fullWidth"
              value={value}
              indicatorColor="primary"
              textColor="primary"
              onChange={handleTab}
              aria-label="disabled tabs example"
            >
              <Tab label="All Tasks" />
              <Tab label="My Tasks" />
            </Tabs>
          </Paper>
          {
            parseInt(value) === 0 ?
            <>
            { tasks.length >= 0 &&
              tasks.map((task, index) => (
              <Grid item xs={12} key={index} style={{marginTop:'8px'}}>
                <Card>
                  <CardActionArea
                    component={Link}
                    to={(location) => `${location.pathname}/${task.id}`}
                  >
                    <CardHeader
                      avatar={
                        <Avatar>
                          {task.created_by.split(" ")[0].charAt(0) + task.created_by.split(" ")[1].charAt(0)}
                        </Avatar>
                      }
                      title={task.task}
                      subheader={task.created_by}
                    />
                  <CardContent>
                    {
                      task.subtasks.map(sub => {
                        return (
                          <Typography variant="body2">
                            {sub.title}
                          </Typography>
                        )
                      })
                    }
                  </CardContent>
                  </CardActionArea>
                  <CardActions>
                  { 
                    task.is_taken ?
                      null
                      :
                      <Button color="primary" variant="contained" onClick={() => setFollow(task.id)}>
                          Follow
                      </Button>
                  }
                  </CardActions>
                </Card>
              </Grid>
              ))
            }
            </>
            :
            <>
            {
              mytasks.map((task, index) => (
              <Grid item xs={12} key={index}>
              <Card>
                  <CardActionArea
                    component={Link}
                    to={(location) => `${location.pathname}/${task.id}`}
                  >
                    <CardHeader
                      avatar={
                        <Avatar>
                          {task.created_by.split(" ")[0].charAt(0) + task.created_by.split(" ")[1].charAt(0)}
                        </Avatar>
                      }
                      title={task.task}
                      subheader={task.created_by}
                    />
                 
                    <CardContent>
                      {
                        task.subtasks.map(sub => {
                          return (
                            <Typography variant="body2">
                              {sub.title}
                            </Typography>
                          )
                        })
                      }
                    </CardContent>
                  </CardActionArea>
                  <CardActions>
                    <Button color="secondary" variant="contained">
                        Update progress
                    </Button>                  
                  </CardActions>
                </Card>
              </Grid>
              ))
            }
            </>
          }
      </Grid>
      {user && (
        <Grid container item xs={12} md={4} direction="column" spacing={1}>
          <Grid item>
            <Button variant="contained" fullWidth onClick={toggleOpen}>
              Add Task
            </Button>
          </Grid>
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
        </Grid>
      )}
      <Dialog open={open} onClose={toggleOpen} fullWidth>
        <DialogTitle>New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            variant="outlined"
            id="task"
            label="Task Name"
            type="text"
            fullWidth required
            onChange={handleChange}
          />
          {
            subtasks.map((subtask, index) => (
                <TextField
                variant="outlined"
                id={index}
                value={subtask.title}
                label="Add Subtask"
                type="text"
                fullWidth
                onChange={handleChange}
                className={classes.textInput}
                multiline
              />
            ))
          }
        </DialogContent>
        <DialogActions>
           <Button onClick={removeSubtasks} color="default" disabled={subtasks.length === 1}>
            Remove subtask
          </Button>
          <Button onClick={addSubtasks} color="default" disabled={subtasks.length === 5}>
            Add Subtask
          </Button>
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
