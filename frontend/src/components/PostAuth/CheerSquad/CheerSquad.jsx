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
import SingleCheer from "./SingleCheer";

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

export default function CheerSquad() {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [cookie, setCookie] = useState(null);
  const [value, setValue] = useState(0);

  const [atloading, setAtloading] = useState(true)
  const [mtloading, setMtloading] = useState(true)

  const [atPage, setAtPage] = useState(1)

  const [tasks, setTasks] = useState([]);
  const [mytasks, setMyTasks] = useState([]);

  const [atEnd, setAtEnd] = useState(false)


  const [follow, setFollow] = useState(-1);

  const [task, setTask] = useState({ "task": "" });
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

  const [currentTask, setCurrentTask] = useState(-1);

  const toggleOpen = () => setOpen(!open);

  const removeSubtasks = () => {
    const newSubTasks = [...subtasks];
    newSubTasks.pop();
    setSubTasks(newSubTasks);
  }

  const addSubtasks = () => {
    setSubTasks([...subtasks, { "title": "" }]);
  }

  const handleChange = (e) => {
    const eti = e.target.id;
    const etv = e.target.value;
    if (eti === 'task') {
      setTask({ ...task, task: etv });
    } else {
      const newSubTasks = [...subtasks];
      newSubTasks[eti] = { "title": etv }
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
    if (parseInt(newValue) === 0 && atloading) {
      getMyTasks(1);

    } else if (parseInt(newValue) === 1 && mtloading) {
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
        enqueueSnackbar(response.data.message, { variant: 'success' });
        setOpen(!open);
      })
      .catch(err => {
        enqueueSnackbar(err.message, { variant: 'error' })
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
        setAtPage(page)
        setTasks([...tasks, ...response.data.post_list]);
        setAtloading(false)
        if (response.data.post_list.length < 10)
          setAtEnd(true)
      })
      .catch(error => {
        setAtEnd(true)
        enqueueSnackbar('Could not fetch tasks', { variant: 'error' });
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
        setMtloading(false)
      })
      .catch(error => {
        enqueueSnackbar('Could not fetch tasks', { variant: 'error' });
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
        setFollow(-1);
        enqueueSnackbar(res.data.message, { variant: 'success' });

      })
      .catch(err => {
        enqueueSnackbar(err.message, { variant: 'error' })
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
              Do you want to follow this task?
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

      <Grid container item xs={12} md={8} spacing={1}>
        <Grid item xs={12}>
          <Paper>
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
        </Grid>
        <Grid container item spacing={1} className={classes.scrollable}>
          {
            parseInt(value) === 0 ?
              (atloading
                ?
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      avatar={
                        <Skeleton variant='circle'>
                          <Avatar />
                        </Skeleton>
                      }
                      title={<Skeleton variant="text" width="80%" />}
                      subheader={<Skeleton variant="text" width="40%" />}
                    />
                    <CardContent>
                      <Skeleton variant='text' width="40%" />
                      <Skeleton variant='text' width="40%" />
                      <Skeleton variant='text' width="40%" />
                    </CardContent>
                  </Card>
                </Grid>
                :
                <>
                  {tasks.map((task, index) => (
              <Grid item xs={12} key={index} >
                    <Card>
                      <CardActionArea
                        onClick={() => {
                          setCurrentTask(-1)
                          setTimeout(() => setCurrentTask(index))
                        }}
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
                      {
                        !task.is_taken &&
                        <CardActions>
                          <Button color="primary" variant="contained" onClick={() => setFollow(task.id)}>
                            Follow
                      </Button>
                        </CardActions>
                      }
                    </Card>
                  </Grid>
              ))}
              <Grid item xs={12}>
                    {
                      atEnd && !atloading ?
                        <Card>
                          <CardMedia
                            style={{ height: 300 }}
                            image="https://images.unsplash.com/photo-1502726299822-6f583f972e02?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=967&q=80"
                          />
                          <CardContent style={{ textAlign: "center" }}>
                            All done for now! Welcome to the bottom of the Ocean!
                    </CardContent>
                        </Card>
                        :
                        <Card>
                          <ReactVisibilitySensor
                            onChange={visible => visible && getTasks(atPage + 1)}
                          >
                            <CardHeader
                              avatar={
                                <Skeleton variant='circle'>
                                  <Avatar />
                                </Skeleton>
                              }
                              title={<Skeleton variant="text" width="80%" />}
                              subheader={<Skeleton variant="text" width="40%" />}
                            />
                          </ReactVisibilitySensor>
                          <CardContent>
                            <Skeleton variant='text' width="40%" />
                            <Skeleton variant='text' width="40%" />
                            <Skeleton variant='text' width="40%" />
                          </CardContent>
                        </Card>
                    }
                  </Grid>
                </>
              )
              :
              <>
                {
                  mytasks.map((task, index) => (
                    <Grid item xs={12} key={index}>
                      <Card>
                        <CardActionArea
                          onClick={() => {
                            setCurrentTask(-1)
                            setTimeout(() => setCurrentTask(index))
                          }}
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
                      </Card>
                    </Grid>
                  ))
                }
              </>
          }
        </Grid>
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
          <Grid item>
            {
              currentTask !== -1 && <SingleCheer task={tasks[currentTask]} />
            }
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
