import Axios from "axios";
import React, { useEffect, useState } from "react";
import {
    Avatar,
    Button,
    Card,
    CardActionArea,
    CardContent,
    CardHeader,
    Grid,
    List,
    ListItemSecondaryAction,
    ListItemText,
    Switch,
} from "@material-ui/core";
import { useParams } from "react-router-dom";
import { getCookie } from "../../../cookie/cookie";
import { useSnackbar } from 'notistack';

const SingleCheer = ({ task }) => {
    console.log(task);
    const [loading, setLoading] = useState(true);
    const [checkedUp, setCheckedUp] = useState([]);
    const [checkedDown, setCheckedDown] = useState([]);
    const [goal, setGoal] = useState({});
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [cookie, setCookie] = useState(null);
    const [currentUser, setCurrentUser] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    useEffect(() => {
        setCookie(getCookie("usertoken"));
    }, []);

    useEffect(() => {
        if (cookie !== null) {
            getData();
        }
    }, [cookie]);

    const getData = () => {
        Axios.get(`http://localhost:8000/api/cheer/${task.id}/`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cookie}`,
            },
        })
            .then((res) => {
                console.log(res.data.data);
                setGoal(res.data.data);
                setCheckedUp(res.data.data.subtasks.map((obj) => obj.is_subtask));
                setCurrentUser(res.data.data.current_user.length > 0);
                if (res.data.data.current_user.length > 0) {
                    setCheckedDown(
                        res.data.data.current_user.map((obj) => obj.is_subtask)
                    );
                }
                setProgress1(Math.round(res.data.data.progress1));
                setProgress2(Math.round(res.data.data.progress2));
            })
            .catch((err) => {
                enqueueSnackbar(err.message, {variant: 'error'});
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const updateTask = () => {
        Axios.patch(
            `http://localhost:8000/api/cheer/update/`,
            {
                id: task.id,
                subtasks:
                    checkedDown.length > 0
                        ? goal.subtasks
                            .filter((obj, index) => checkedDown[index])
                            .map((obj) => ({ title: obj.title }))
                        : goal.subtasks
                            .filter((obj, index) => checkedUp[index])
                            .map((obj) => ({ title: obj.title })),
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cookie}`,
                },
            }
        )
            .then(res => enqueueSnackbar(res.data.message, {variant: 'success'}))
            .catch((err) => enqueueSnackbar(err.message, {variant: 'error'}))
            .finally(getData);
    };
    return !loading ? (
        <>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Card>
                        <CardHeader
                            avatar={
                                <Avatar>
                                    {progress1}%
                </Avatar>
                            }
                            title={goal.task}
                            subheader={goal.created_by}
                        />
                        <CardContent>
                            {goal.subtasks.map((obj, index) => (
                                <List>
                                    <ListItemText id={index} key={index} primary={obj.title} />
                                    <ListItemSecondaryAction>
                                        <Switch
                                            edge="end"
                                            checked={checkedUp[index]}
                                            onChange={(event) => {
                                                let temp = [...checkedUp];
                                                temp[index] = event.target.checked;
                                                setCheckedUp(temp);
                                            }}
                                            disabled={!task.is_taken || currentUser}
                                        />
                                    </ListItemSecondaryAction>
                                </List>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
                {
                    checkedDown.length > 0 &&
                    <Grid item xs={12}>
                        <Card>
                            <CardHeader
                                avatar={
                                    <Avatar>
                                        {progress2}%
                            </Avatar>
                                }
                                title='Your Progress'
                            />
                            <CardContent>
                                {goal.subtasks.map((obj, index) => (
                                    <List>
                                        <ListItemText id={index} key={index} primary={obj.title} />
                                        <ListItemSecondaryAction>
                                            <Switch
                                                edge="end"
                                                checked={checkedDown[index]}
                                                onChange={(event) => {
                                                    let temp = [...checkedDown];
                                                    temp[index] = event.target.checked;
                                                    setCheckedDown(temp);
                                                }}
                                            />
                                        </ListItemSecondaryAction>
                                    </List>
                                ))}
                            </CardContent>
                        </Card>
                    </Grid>
                }
            </Grid>
            {
                task.is_taken &&
                <Button fullWidth onClick={updateTask} color="primary" variant="contained">
                    Update Progress
                </Button>
            }
        </>
    ) : null;
};

export default SingleCheer;
