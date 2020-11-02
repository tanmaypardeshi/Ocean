import React, { useState, useContext } from 'react';
import { Fab, Hidden, Typography, Button, CssBaseline, TextField, Link, Paper, Grid } from '@material-ui/core';
import { Brightness4, Brightness7 } from '@material-ui/icons';
import WavesIcon from '@material-ui/icons/Waves';
import { makeStyles } from '@material-ui/styles';
import { Link as RRDLink, useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Axios from 'axios';


import { ThemeContext } from '../../context/useTheme';
import { setUserTokenCookie } from '../../cookie/cookie';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    // fontSize: '18px'
  },
  paper: {
    padding: theme.spacing(0, 4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: {
    backgroundImage: theme.palette.type === "light" ? 
    'url("https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80")' 
    : 
    'url("https://images.unsplash.com/photo-1566342088293-38debd381c63?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80")'
    ,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: '30%'
  },
  ocean: {
    fontFamily: "'Open Sans', sans-serif",
    height: '90%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    fontSize: '18px'
  },
  fab: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  }
}));

export default function Login() {

  const classes = useStyles();

  const history = useHistory();

  const {dark, toggleTheme} = useContext(ThemeContext)

  const { enqueueSnackbar } = useSnackbar()

  const [details, setDetails] = useState({
    email: '',
    password: '',
  })

  const handleChange = e => {
    const et = e.target
    if (!!et.id)
        setDetails({...details, [et.id]: et.value})
    else
        setDetails({...details, [et.name]: et.value})    
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!details.email || !details.password) {
      enqueueSnackbar("Please fill all fields to login",  { variant: 'error' })
      return
    }
    Axios.post(
      "http://localhost:8000/api/user/login/",
      details,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    .then(res => {
      setUserTokenCookie(res.data.token);
      enqueueSnackbar('Login Successful', { variant: 'success'});
      history.push('/home');
    })
    .catch(err => {
      enqueueSnackbar('Invalid credentials', {
        variant: 'error'
      })
    })
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={8} alignContents="center" className={classes.image} >
        <Hidden smDown>
          <Typography 
            component="h1" 
            variant="h1" 
            className={classes.ocean}          
          >
            Ocean
          </Typography>
        </Hidden>
      </Grid>
      <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Hidden smUp>
            <WavesIcon fontSize="large"/>
            <Typography variant="h3">
              Ocean
            </Typography>
          </Hidden>
          <Hidden smDown>
            <Typography component="h1" variant="h3">
              Login
            </Typography>
          </Hidden>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              onChange={handleChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSubmit}
            >
              Sign In
            </Button>
            <Grid container>
              <Grid item xs>
                <Link component={RRDLink} to='/register'>
                  Don't have an account? Sign Up
                </Link>
              </Grid>
              <Grid item>
                <Link component={RRDLink} to='/forgot'>
                  Forgot Password?
                </Link>
              </Grid>
            </Grid>
          </form>
        </div>
      </Grid>
        <Fab color="secondary" aria-label="toggle" onClick={toggleTheme} className={classes.fab}>
            {dark ? <Brightness7/> : <Brightness4/>}
        </Fab>
    </Grid>
  );
}