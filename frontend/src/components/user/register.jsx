import React, { useState, useContext } from 'react';
import { MenuItem, Fab, Hidden, Typography, Button, 
        CssBaseline, TextField, Link, Paper, Grid,
        Chip} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { Link as RRDLink, useHistory } from 'react-router-dom';
import { Brightness4, Brightness7 } from '@material-ui/icons'
import WavesIcon from '@material-ui/icons/Waves';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useSnackbar } from 'notistack';
import Axios from 'axios';

import countries from './countries.json';
import { setUserTokenCookie } from '../../cookie/cookie';
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

export default function Register() {

  const classes = useStyles();

  const {dark, toggleTheme} = useContext(ThemeContext);

  const { enqueueSnackbar } = useSnackbar();

  const history = useHistory();

  
  const [tags, setTags] = useState([
    {selected: false, value:'productivity'},
    {selected: false, value:'self_help'},
    {selected: false, value:'self_improvement'},
    {selected: false, value:'personal_development'},
    {selected: false, value:'spirituality'},
    {selected: false, value:'motivation'},
    {selected: false, value:'positivity'},
    {selected: false, value:'career'},
    {selected: false, value:'discipline'},
    {selected: false, value:'relationships'},
    {selected: false, value:'success'},
    {selected: false, value:'depression'},
    {selected: false, value:'anxiety'},
    {selected: false, value:'ptsd'},
    {selected: false, value:'alcohol'},
    {selected: false, value:'internet_addiction'},
    {selected: false, value:'bipolar_disorder'},
    {selected: false, value:'social_anxiety_disorder'},
    {selected: false, value:'stress'},
    {selected: false, value:'sleep_disorder'},
    {selected: false, value:'empathy_deficit_disorder'}
  ]);
  const [stage, setStage] = useState(0)
  const [details, setDetails] = useState({
      "email": "",
      "password": "",
      "confpass": "",
      "first_name": "",
      "last_name": "",
      "dob": new Date().toISOString().slice(0,10),
      "gender": "",
      "country": "",
      "tags": ""
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
      if(stage === 2) {
         if(!details.gender || !details.country) {
          enqueueSnackbar('All fields must be filled!', { variant: 'error' })
          return;
         }
         Axios.post(
          "http://localhost:8000/api/user/register/",
          details,
          { 
            headers: 
            { 
              'Content-Type': 'application/json' 
            } 
          }
        )
        .then(res => {
          setUserTokenCookie(res.data.token);
          enqueueSnackbar('Registration successful!', { variant: 'success' })
          history.push('/home');
        })
        .catch(err => {
          enqueueSnackbar(err.message, { variant: 'error' });
        })
        
      } else if (stage === 1) {
        let detail_tags = "";
        tags.map(tag => { 
            if(tag.selected) {
                detail_tags += tag.value + " ";
            }
            return detail_tags;
        });
        setDetails({...details, tags: detail_tags.substring(0, detail_tags.length - 1)});
        if(!details.first_name || !details.last_name) {
          enqueueSnackbar('All fields must be filled!', { variant: 'error' })
          return;
        } 
      } else {
        if(!details.email || !details.password) {
          enqueueSnackbar('All fields must be filled!', { variant: 'error' })
            return;
        } 
        if(details.password.length < 8) {
          enqueueSnackbar('Password Length should be 8 characters', { variant: 'error' })
            return;
        }
        if (details.password !== details.confpass) {
          enqueueSnackbar('Password mismatch!', { variant: 'error' })
          return;
        }
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
                value={details.email}
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
                value={details.password}
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
                value={details.confpass}
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
                value={details.first_name}
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
                value={details.last_name}
                autoFocus
                onChange={handleChange}
              />
              <div className={classes.chip}>
              {
                tags.map((tag,index) => {
                return (
                  <Chip
                    id={index}
                    label={tag.value.split('_').join(' ')}
                    key={index}
                    color={tag.selected ? "primary": "default"}
                    clickable
                    style={{fontSize:'16px'}}
                    onClick={() => {
                      let newTags = [...tags];
                      newTags[index].selected = !newTags[index].selected;
                      setTags(newTags);
                    }}
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
                  value={details.country}
                  autoFocus
                  select
                  onChange={handleChange}
                >
                {countries.map(country => {
                  return (
                    <MenuItem value={country.countryName}>{country.countryName}</MenuItem>
                  )
                })}
                  
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
                  value={details.gender}
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