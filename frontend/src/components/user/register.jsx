import React, { useState, useContext, useEffect } from 'react';
import { MenuItem, Fab, Hidden, Typography, Button, 
        CssBaseline, TextField, Link, Paper, Grid,
        FormControl, FormControlLabel, RadioGroup,
        Radio, FormLabel, Chip} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link as RRDLink, useHistory } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@material-ui/icons'
import WavesIcon from '@material-ui/icons/Waves';
import { Autocomplete } from '@material-ui/lab';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useSnackbar } from 'notistack';
import Axios from 'axios';


import { ThemeContext } from '../../context/useTheme';
import signup from '../../images/signup.svg'

const tags = ['productivity', 'self_help', 'self_improvement ', 'personal_development',
              'spirituality','motivation','positivity','career', 'discipline','relationship',
              'success','depression','anxiety','ptsd','alcohol','internet_addiction', 
              'bipolar_disorder','social_anxiety_disorde','stress','sleep_disorder',
              'empathy_deficit_disorder']

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    fontSize: '18px'
  },
  paper: {
    margin: theme.spacing(0, 4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ocean: {
    fontFamily: "'Open Sans', sans-serif",
    height: '40%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

export default function Register() {

  const classes = useStyles();

  const {dark, toggleTheme} = useContext(ThemeContext);

  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();

  const [stage, setStage] = useState(0)
  const [details, setDetails] = useState({
      "email": "",
      "password": "",
      "first_name": "",
      "last_name": "",
      "dob": new Date(),
      "gender": "",
      "country": "",
      "tags": ""
  });

  const handleClick = (event) => {
      console.log(event.target.id);
      console.log(event.target.value);
  }
  const handleChange = () => {
    
  }
  
  const handleSubmit = e => {
      e.preventDefault();
      setStage((stage+1)%3);
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={8} alignContents="center" style={{backgroundColor: dark ? "rgba(0,0,0,0.5)" : "rgba(220,220,220,0.5)"}}>
        <Hidden smDown>
          <Typography 
            component="h1" 
            variant="h1" 
            className={classes.ocean}          
          >
            Ocean
          </Typography>
          <img src={signup} alt="signup"/> 
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
              Sign Up   
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
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="confpass"
                label="Confirm Password"
                type="password"
                id="confpass"
                autoComplete="confirm-password"
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
                id="first_name"
                label="First name"
                name="first_name"
                autoComplete="first_name"
                autoFocus
                onChange={handleChange}
              /> 
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="last_name"
                label="Last name"
                name="last_name"
                autoComplete="last_name"
                autoFocus
                onChange={handleChange}
              />
              <div className={classes.chip}>
              {
                tags.map((tag) => {
                return (
                  <Chip
                    id={tag}
                    label={tag}
                    onClick={handleClick}
                  />
                )})
              }
              </div>
              </>
              :
              <>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    inputVariant="outlined"
                    variant="inline"
                    format="yyyy-MM-dd"
                    margin="normal"
                    id="dob"
                    label="Date of birth"
                    value={details.dob}
                    onChange={(d,v) => handleChange({ target: { id: "dob", value: v}})}
                    fullWidth
                    autoComplete="dob"
                  />
                </MuiPickersUtilsProvider>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="country"
                  label="Country"
                  name="country"
                  autoComplete="country"
                  autoFocus
                  select
                  onChange={handleChange}
                >
                  <MenuItem value="India">India</MenuItem>
                  <MenuItem value="Pakistan">Pakistan</MenuItem>
                  <MenuItem value="Konoha">Konoha</MenuItem>
                </TextField>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="gender"
                  label="Gender"
                  name="gender"
                  autoComplete="gender"
                  autoFocus
                  select
                  onChange={handleChange}
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
             
              </>
            }
            {
              stage > 0 && <Button fullWidth color="primary" className={classes.submit} onClick={() => setStage(stage-1)}>Go back</Button>
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