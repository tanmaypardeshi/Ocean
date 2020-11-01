import React, { useState, useContext, useEffect } from 'react';
import { MenuItem, Fab, Hidden, Typography, Button, 
        CssBaseline, TextField, Link, Paper, Grid,
        Chip} from '@material-ui/core';
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
    {color:'secondary', value:'productivity'},
    {color:'secondary', value:'self_help'},
    {color:'secondary', value:'self_improvement '},
    {color:'secondary', value:'personal_development'},
    {color:'secondary', value:'spirituality'},
    {color:'secondary', value:'motivation'},
    {color:'secondary', value:'positivity'},
    {color:'secondary', value:'career'},
    {color:'secondary', value:'discipline'},
    {color:'secondary', value:'relationship'},
    {color:'secondary', value:'success'},
    {color:'secondary', value:'depression'},
    {color:'secondary', value:'anxiety'},
    {color:'secondary', value:'ptsd'},
    {color:'secondary', value:'alcohol'},
    {color:'secondary', value:'internet_addiction'},
    {color:'secondary', value:'bipolar_disorder'},
    {color:'secondary', value:'social_anxiety_disorder'},
    {color:'secondary', value:'stress'},
    {color:'secondary', value:'sleep_disorder'},
    {color:'secondary', value:'empathy_deficit_disorder'}
  ]);
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

  const handleChange = () => {
    
  }
  
  const handleSubmit = e => {
      e.preventDefault();
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
                tags.map((tag,index) => {
                return (
                  <Chip
                    id={index}
                    label={tag.value}
                    key={index}
                    color="secondary"
                    clickable
                    style={{fontSize:'16px'}}
                    onClick={() => {
                      let newTags = [...tags];
                      newTags[index].color = "primary";
                      setTags(newTags);
                      setDetails({...details, tags: tags + ' ' + newTags[index].value});
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