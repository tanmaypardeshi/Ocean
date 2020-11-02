import React, { useState, useContext } from 'react';
import { Fab, Hidden, Typography, Button, CssBaseline, TextField, Link, Paper, Grid,} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link as RRDLink, useHistory } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@material-ui/icons'
import WavesIcon from '@material-ui/icons/Waves';
import { useSnackbar } from 'notistack';
import Axios from 'axios';

import { ThemeContext } from '../../context/useTheme';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    // fontSize: '18px'
  },
  paper: {
    margin: theme.spacing(0, 4),
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
  },
  chip: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    }
  }
}));

export default function Forgot() {

  const classes = useStyles();

  const {dark, toggleTheme} = useContext(ThemeContext);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();


  const [stage, setStage] = useState(0)
  const [details, setDetails] = useState({
    "email": "",  
    "otp": "",
    "new_password": "",
  });

  const handleChange = (event) => {
    const et = event.target;
    if(!!et.id) {
      setDetails({...details, [et.id]: et.value})
    }  else {
      setDetails({...details, [et.name]: et.value});
    }
  }
  
  const handleSubmit = e => {
      e.preventDefault();
      if(stage === 0) {
         Axios.post(
          "http://localhost:8000/api/user/otp/",
          details,
          { 
            headers: 
            { 
              'Content-Type': 'application/json' 
            } 
          }
        )
        .then(res => {
          enqueueSnackbar(`OTP sent to ${details.email} successful!`, { variant: 'success' })
          setStage(1);
        })
        .catch(err => {
          enqueueSnackbar(err.message, { variant: 'error' });
        })
        
      } else if (stage === 1) {
        if(!details.otp) {
          enqueueSnackbar('Please enter OTP!', { variant: 'error' })
          return;
        }
        Axios.post(
            "http://localhost:8000/api/user/verify/",
            details,
            { 
              headers: 
              { 
                'Content-Type': 'application/json' 
              } 
            }
          )
          .then(res => {
            enqueueSnackbar(`Successful!`, { variant: 'success' })
            setStage(2);
          })
          .catch(err => {
            enqueueSnackbar(err.message, { variant: 'error' });
          })
      } else {
        if(!details.new_password) {
            enqueueSnackbar('Please enter new password!', { variant: 'error' })
            return;
        }
        Axios.post(
            "http://localhost:8000/api/user/forgot/",
            details,
            { 
              headers: 
              { 
                'Content-Type': 'application/json' 
              } 
            }
          )
          .then(res => {
            enqueueSnackbar(`Successful!`, { variant: 'success' })
            history.push('/');
          })
          .catch(err => {
            enqueueSnackbar(err.message, { variant: 'error' });
          })
      
      }
      setStage((stage+1)%3);
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={8} alignContents="center" className={classes.image}>
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
            Forgot Password 
            </Typography>
          </Hidden>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            {
              stage === 0 ?
              <>
              
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={details.email}
                onChange={handleChange}
              />
              </>
              :
              stage === 1 ?
              <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="otp"
                label="OTP"
                name="otp"
                autoComplete="otp"
                value={details.otp}
                autoFocus
                onChange={handleChange}
              /> 
              </>
              :
              <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="new_password"
                label="New Password"
                type="password"
                id="new_password"
                value={details.new_password}
                autoComplete="new_password"
                onChange={handleChange}
              />
              </>
            }
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
            >
              {
                  stage < 2 ? "Next" : "Submit"
              }
            </Button>
            {
              stage > 0 && <Button fullWidth color="primary" className={classes.submit} onClick={() => setStage(stage-1)}>Go back</Button>
            }
          </form>
            <Grid container>
              <Grid item>
                <Link component={RRDLink} to='/'>
                  Already have an account? Login instead
                </Link>
              </Grid>
            </Grid>
        </div>
      </Grid>
        <Fab color="secondary" aria-label="toggle" onClick={toggleTheme} className={classes.fab}>
            {dark ? <Brightness7/> : <Brightness4/>}
        </Fab>
    </Grid>
  );
}