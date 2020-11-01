import React, { useState, useContext, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/styles';
import { Link as RRDLink, useHistory } from 'react-router-dom';
import { MenuItem, Hidden } from '@material-ui/core';
import { ThemeContext } from '../../context/useTheme';
import { Fab } from '@material-ui/core';
import { Brightness4, Brightness7 } from '@material-ui/icons'
import Axios from 'axios'
import { Autocomplete } from '@material-ui/lab'
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1489&q=80)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'right'
  },
  paper: {
    margin: theme.spacing(0, 4),
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cosmicom: {
    fontFamily: "'Open Sans', sans-serif",
    height: '100%',
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
  },
  fab: {
    position: 'absolute',
    top: theme.spacing(2),
    left: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
  }
}));

export default function Register() {

  const classes = useStyles();

  const {dark, toggleTheme} = useContext(ThemeContext)

  const { enqueueSnackbar } = useSnackbar()
  const history = useHistory()

  const [stage, setStage] = useState(0)
  const [countries, setCountries] = useState([])
  const [details, setDetails] = useState({
      usertype: "user",
      dob: new Date()
  })

  useEffect(() => {
    Axios.get(
      'http://localhost:8000/countries'
    )
    .then(res => {
      setCountries(res.data)
    })
    .catch(err => alert(err))
  },[])

  const handleChange = e => {
    const et = e.target
    if (!!et.id)
        setDetails({...details, [et.id]: et.value})
    else
        setDetails({...details, [et.name]: et.value})    
  }

  const handleCountryChange = (e,v) => {
    handleChange({target: {
      id: e.target.id.split("-")[0],
      value: v.code
    }})
  }

  const handleSubmit = e => {
      e.preventDefault()
      
      if (stage === 2) {
        if (!details.name || !details.email || !details.password) {
          enqueueSnackbar('All fields must be filled!', { variant: 'error' })
          return;
        }
        if (details.password !== details.confpass) {
          enqueueSnackbar('Password mismatch!', { variant: 'error' })
          return;
        }

        Axios.post(
          "http://localhost:8000/register",
          details,
          { headers: { 'Content-Type': 'application/json' } }
        )
        .then(res => {
          enqueueSnackbar('Registration successful!', { variant: 'success' })
          history.push('/')
        })
        .catch(err => {
          enqueueSnackbar(err.response.data, { variant: 'error' })
        })
        return;
      }
      else if (stage === 1) {
        if (details.usertype === "user") {
          if (!details.country_code || !details.gender || !details.phone) {
            enqueueSnackbar('All fields must be filled!', { variant: 'error' })
            return;
          }
        }
        else {
          if (!details.country_code || !details.website) {
            enqueueSnackbar('All fields must be filled!', { variant: 'error' })
            return;
          }
        }
      }
      setStage((stage+1)%3)
  }

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={8} className={classes.image} >
        <Hidden smDown>
        <Typography 
          component="h1" 
          variant="h2" 
          className={classes.cosmicom} 
          style={{
            backgroundColor: dark ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"
          }}
        >
          Cosmicom
        </Typography>
        </Hidden>
      </Grid>
      <Grid item xs={12} sm={8} md={4} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Typography component="h1" variant="h5">
            Register
          </Typography>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            {
              stage === 0 ?
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="usertype"
                label="How do you plan to use this website?"
                name="usertype"
                autoComplete="usertype"
                autoFocus
                select
                value={details.usertype}
                onChange={handleChange}
              >
                  <MenuItem value="user">As a customer</MenuItem>
                  <MenuItem value="merchant">As a merchant</MenuItem>
                  <MenuItem value="shipper">As a shipper</MenuItem>
              </TextField> :
              stage === 1 ?
              <>
              <Autocomplete
                id="country_code"
                fullWidth
                options={countries}
                onChange={handleCountryChange}
                autoHighlight
                getOptionLabel={option => option.name}
                renderOption={option =>
                  <>
                    {`[${option.code}] ${option.name} [${option.dial_code}]`}
                  </>
                }
                renderInput={params =>
                  <TextField
                    {...params}
                    label="Choose a country"
                    variant="outlined"
                    inputProps={{
                      ...params.inputProps,
                      autoComplete: 'new-password'
                    }}
                  />
                }
              />
              {
                details.usertype === "user" 
                ?
                <>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="gender"
                  label="Gender"
                  name="gender"
                  autoComplete="gender"
                  onChange={handleChange}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Phone no"
                  name="phone"
                  autoComplete="phone"
                  type="number"
                  onChange={handleChange}
                />
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
                </>
                :
                <>
                  <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="website"
                  label="Website"
                  name="website"
                  autoComplete="website"
                  onChange={handleChange}
                />
                </>
              }
              </>
              :
              <>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full name"
                name="name"
                autoComplete="name"
                autoFocus
                onChange={handleChange}
              />
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
            }
            {
              stage > 0 && <Button fullWidth color="primary" onClick={() => setStage(stage-1)}>Go back</Button>
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