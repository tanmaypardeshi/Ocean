import React, { useEffect, useState } from 'react'
import { Grid, Typography, Card, CardHeader, IconButton, Avatar, CardContent,
		CardActions, CardActionArea, Hidden, Button, Tab, Tabs, Paper, makeStyles } from '@material-ui/core';
import { ThumbUpAlt } from '@material-ui/icons'
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CakeIcon from '@material-ui/icons/Cake';
import { blue } from '@material-ui/core/colors';

import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { Link } from 'react-router-dom'

import { getCookie } from '../../../cookie/cookie';
import { ThemeContext } from '../../../context/useTheme';


const useStyles = makeStyles(theme => ({
    root: {
        marginBottom : '2%'
    },
    avatar : {
        backgroundColor: blue[600],
        color: 'white',
        [theme.breakpoints.up('md')]: {
            height:'2.5em',
            width:'2.5em',
            fontSize:'4em'
        },
        height: '2em',
        width: '2em',
        fontSize: '3em'
    },
    button : {
        backgroundColor: blue[600],
        float: 'right',
        margin: '6%',
        [theme.breakpoints.down('md')]: {
            marginTop: '11%'
        }
    }
}))

export default function Profile() {
		const classes = useStyles();
		const { enqueueSnackbar } = useSnackbar()
    const cookie = getCookie("usertoken");
    const [postpage, setPostPage] = useState(1);
    const [likepage, setLikePage] = useState(1);
    const [commentpage, setCommentPage] = useState(1);

    const [myPosts, setMyPosts] = useState([]);
    const [myLikes, setMyLikes] = useState([]);
    const [myComments, setMyComments] = useState([]);
    
    const [value, setValue] = useState(0);

		const toggleLike = ({ currentTarget }) => {
			const index = currentTarget.id
			const action = myPosts[index].is_liked ? 'unlike' : 'like'
			Axios.post(
					`http://localhost:8000/api/post/${action}/`,
					{ id: myPosts[index].id },
					{
							headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${cookie}`
								}
					}
			)
			.then(res => {
					const newPosts = [...myPosts]
					newPosts[index].is_liked = !myPosts[index].is_liked
					setMyPosts(newPosts)
					enqueueSnackbar(`${action}d`, { variant: 'success'})
			})
			.catch(err => {
					enqueueSnackbar(`Could not ${action}`, { variant: 'error' })
			})
	}

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if(parseInt(newValue) === 0) {
            Axios.get(
                `http://localhost:8000/api/post/myposts/${postpage}`,
                {
                    headers : {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cookie}`
                    }
                }
            )
            .then(response => {
                setMyPosts(response.data.post_list);
            })
            .catch(err => {
                console.log(err);
            })
        } else if(parseInt(newValue) === 1) {
            Axios.get(
                `http://localhost:8000/api/post/mylikes/${likepage}`,
                {
                    headers : {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cookie}`
                    }
                }
            )
            .then(response => {
                setMyLikes(response.data.like_list);
            })
            .catch(err => {
                console.log(err);
            })
        } else if(parseInt(newValue) === 2) {
            Axios.get(
                `http://localhost:8000/api/post/mycomments/${commentpage}`,
                {
                    headers : {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cookie}`
                    }
                }
            )
            .then(response => {
                setMyComments(response.data.comment_list)
                console.log(response.data.comment_list);
            })
            .catch(err => {
                console.log(err);
            })
        } 
    };

    useEffect(() => {
        Axios.get(
            `http://localhost:8000/api/post/myposts/${postpage}`,
            {
                headers : {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            }
        )
        .then(response => {
						setMyPosts(response.data.post_list);
        })
        .catch(err => {
            console.log(err);
        })
     }, [])
    
    return (
        <>
            <Card className={classes.root}>
                <Button className={classes.button}>EDIT PROFILE</Button>
                <CardHeader
                    avatar={
                    <Avatar aria-label="recipe"className={classes.avatar}>
                        TP
                    </Avatar>
                    }
                />
                <Hidden smDown>
                    <CardContent>
                        <Typography display="inline" variant="h4">Tanmay Pardeshi | </Typography>
                        <Typography display="inline" color="textSecondary" variant="h4"> tanmaypardeshi@gmail.com</Typography>
                    </CardContent>
                </Hidden>
                <Hidden smUp>
                    <CardContent>
                        <Typography variant="h6">Tanmay Pardeshi</Typography>
                        <Typography color="textSecondary" variant="h6"> tanmaypardeshi@gmail.com</Typography>
                    </CardContent>
                </Hidden>
                <IconButton style={{paddingTop:'0%'}}>
                    <LocationOnIcon/>
                    India
                </IconButton>
                <br/>
                <IconButton style={{paddingTop:'0%'}}>
                    <CakeIcon/>
                    7th March 2020
                </IconButton>
            </Card>
            <Paper square>
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
                    <Tab label="My Comments"/>
                </Tabs>
                {
                    parseInt(value) === 0 ? 
                    <>
											{
												myPosts.map((post,index) => {
													return(
														<Grid item key={index}>
																<Card>
																		<CardActionArea component={Link} to={`/home/feed/${post.id}`}>
																		<CardHeader
																				avatar={
																						<Avatar>
																						{
																								post.is_anonymous ?
																								'AU' :
																								post.first_name[0] + post.last_name[0]
																						}
																						</Avatar>
																				}
																				title={post.is_anonymous ? 'Anonymous User' : post.first_name + post.last_name}
																				subheader={new Date(post.published_at).toLocaleString()}
																		/>
																		<CardContent>
																				<Typography variant="h6">{post.title}</Typography>
																				<br/>
																				<Typography paragraph variant="body2">
																						{post.description.split(" ").slice(0, 50).join(" ") + "..."}
																				</Typography>
																				<Typography color="primary">
																				{post.tags.map((tag, index) => 
																						<span key={index}> #{tag}</span>
																				)}
																				</Typography>
																				<Typography paragraph variant="body2">{ post.is_anonymous ? 'Posted Anonymously' : 'Not an anonymous post'}</Typography>		
																		</CardContent>
																		</CardActionArea>
																		<CardActions>
																				<IconButton id={index} onClick={toggleLike}>
																						<ThumbUpAlt
																								style={{
																										color: post.is_liked ? blue[600]: 'grey'
																								}}
																						/>
																				</IconButton>
																		</CardActions>
																</Card>
														</Grid>
													)})
												}
                    </>
                    :
                    parseInt(value) === 1 ?
										<>
											{
												myLikes.map((like,index) => {
													return(
														<Grid item key={index}>
																<Card>
																		<CardActionArea component={Link} to={`/home/feed/${like.post_id}`}>
																		<CardHeader
																				avatar={
																						<Avatar>
																						{
																								like.is_anonymous ?
																								'AU' :
																								like.author.split(' ')[0].charAt(0) + like.author.split(' ')[1].charAt(0)
																						}
																						</Avatar>
																				}
																				title={like.author}
																		/>
																		<CardContent>
																				<Typography variant="h6">Post Title: {like.post_title}</Typography>
																				<br/>
																		</CardContent>
																		</CardActionArea>
																</Card>
														</Grid>
													)})
											}  
                    </>
										:
										parseInt(value) === 2 ?
										<>
										{
											myComments.map((comment,index) => {
												return(
													<Grid item key={index}>
															<Card>
																	<CardActionArea component={Link} to={`/home/feed/${comment.post_id}`}>
																	<CardHeader
																			avatar={
																					<Avatar>
																					{
																						comment.author.split(' ')[0].charAt(0) + comment.author.split(' ')[1].charAt(0)
																					}
																					</Avatar>
																			}
																			title={`Post Author : ${comment.author}`}
																	/>
																	<CardContent>
																				<Typography variant="h6">{`Post title : ${comment.post_title}`}</Typography>
																				<br/>
																				<Typography paragraph variant="body2">
																						{`Comment : ${comment.content}`}
																				</Typography>
																				<Typography paragraph variant="body2">{` Commented at: ${new Date(comment.published_at).toLocaleString()}`}</Typography>		
																				<Typography paragraph variant="body2">{ comment.is_anonymous ? 'Commented Anonymously' : 'Not an anonymous comment'}</Typography>																	
																		</CardContent>
																	</CardActionArea>
															</Card>
													</Grid>
												)})
											}  
										</>
										:
										null
                }
            </Paper>
        </>
    );
}

