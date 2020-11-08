import React, { useEffect, useState } from 'react';
import { Button, makeStyles, fade, Drawer, AppBar, CssBaseline, Toolbar, List, Typography, ListItem, ListItemText, ListItemIcon, IconButton, ListItemAvatar, Grid, Collapse, Hidden, Box, TextField, InputAdornment, Dialog, DialogTitle, Avatar, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Waves, Brightness7, Brightness4, Home, AccountCircle, People, Whatshot, ExitToApp, ExpandLess, ExpandMore } from '@material-ui/icons';
import { ThemeContext } from '../../context/useTheme';
import PersonIcon from '@material-ui/icons/Person';
import Routes from './Routes';
import clsx from 'clsx'
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { addResponseMessage, Widget, addUserMessage, markAllAsRead, renderCustomComponent } from 'react-chat-widget';
import 'react-chat-widget/lib/styles.css'
import Axios from 'axios';
import { getCookie } from '../../cookie/cookie';
import { useSnackbar } from 'notistack';
import tags from './Tags';
import { Autocomplete } from '@material-ui/lab';

const drawerWidth = 300;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  logo: { marginRight: theme.spacing(2) },
  title: {
    flexGrow: 1,
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
  toggleIcon: { marginLeft: theme.spacing(3), float:'right' },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9) + 1,
    },
  },
  drawerPaper: {
    width: drawerWidth,
  },
  drawerContainer: {
    overflowX: 'none'
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  list: {
    paddingLeft: theme.spacing(1)
  },
  nested: {
    paddingLeft: theme.spacing(4)
  }
}));

const drawerItems = [
  {
    name: 'Feed',
    icon: <Home />
  },
  {
    name: 'Profile',
    icon: <AccountCircle />
  },
  // {
  //   name: 'Communities',
  //   icon: <People />
  // },
  {
    name: 'Cheer Squad',
    icon: <Whatshot />
  }
]


export default function ClippedDrawer() {

  const classes = useStyles();

  const location = useLocation();
  const history = useHistory();

  const { dark, toggleTheme } = React.useContext(ThemeContext)

  const { enqueueSnackbar } = useSnackbar()

  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => setOpen(!open);

  const [openComm, setOpenComm] = React.useState(false)

  const [results, setResults] = React.useState([]);

  const time = React.useRef()

  const [moderators, setModerators] = useState([]);
  const [contact, setContact] = useState(false);

  const toggleComm = () => setOpenComm(!openComm)

  const handleLogout = () => {
    document.cookie = "usertoken=; path=/;";
    history.push('/');
  }

  useEffect(() => {
    Axios.get(`http://localhost:8000/api/coral/`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie("usertoken")}`
      }
    })
    .then(res => {
      res.data.chats.reverse().forEach(obj => {
        if (obj.user._id === 1)
          addUserMessage(obj.text)
        else
          addResponseMessage(obj.text)
      })
      markAllAsRead()
    })
    .catch(error => {
      enqueueSnackbar('Could not fetch chats', {variant: 'error'});
    })

  },[])

  const handleNewUserMessage = newMessage => {
    // addResponseMessage('Whatever')
    Axios.post(
      `http://localhost:8000/api/coral/`,
      {
        "createdAt": new Date().toISOString(),
        "text": newMessage,
        "user": { "_id": 1 }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getCookie("usertoken")}`
        }
      }
    )
    .then(res => {
      if(res.data.is_popup) {
        renderCustomComponent(Button, {children: 'Do you want to contact moderators?', onClick: handlePopup, color: "primary", variant: "contained", fullWidth: true});
        setModerators(res.data.moderator_list);
      }
      addResponseMessage(res.data.chat.text)
    })
    .catch(err => {
      addResponseMessage(err.message)
    })
  }

  const handleSearch = (e) => {
    if (e.target.value === '') {
      setResults([])
      return;
    }
    clearTimeout(time.current)
    time.current = setTimeout(() => {
      Axios.post(
        'http://localhost:8000/api/search/',
        {
          "query": e.target.value
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie("usertoken")}`
          }
        }
      )
      .then(res => {
        console.log(res.data.search_results);
        setResults(res.data.search_results);
      })
      .catch(err => {
        console.log(err.message);
      })
    },1000)
  }

  const handlePopup = () => {
    setContact(!contact);
  }
  return (
    <div className={classes.root}>
      {
        moderators.length > 0 
        &&
        <Dialog
          open={contact}
          onClose={handlePopup}
          fullWidth
        >
          <DialogTitle>Moderators you can contact</DialogTitle>
          <Table>
          <TableBody>
          { moderators.map((moderator, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Avatar>
                    <PersonIcon/>
                  </Avatar>
                </TableCell>
                <TableCell><ListItemText primary={moderator.name} /></TableCell>
                <TableCell><ListItemText secondary={moderator.email} /></TableCell>
              </TableRow>
            ))}
            </TableBody>
            </Table>
        </Dialog>
      }

      <CssBaseline />
      <AppBar position="fixed" className={classes.appBar} color="inherit">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.logo}
            color="inherit"
            onClick={toggleDrawer}
          >
            <Waves />
          </IconButton>
          <Typography variant="h4" className={classes.title}>
            Ocean
          </Typography>
          <Autocomplete
            id="ocean-search"
            filterOptions={x=>x}
            options={results}
            getOptionLabel={option=>option.title}
            onChange={(e,v,r,d) => v && history.push(`/home/feed/${v.id}`)}
            renderInput={params => 
              <TextField 
                {...params}
                onChange={handleSearch}
                placeholder="Search"
                style={{width: 250}}
              />
            }
          />
          <IconButton
            onClick={toggleTheme}
            className={classes.toggleIcon}
          >
            {dark ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          <IconButton onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        className={
          clsx(classes.drawer, {
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          })}
        classes={{
          paper: clsx({
            [classes.drawerOpen]: open,
            [classes.drawerClose]: !open,
          }),
        }}
        variant="permanent"
      >
        <Toolbar />
        <div className={classes.drawerContainer}>
          <List>
            {
              drawerItems.map((item, index) =>
                <ListItem 
                  key={index} 
                  selected={location.pathname.includes(item.name.split(" ")[0].toLowerCase())}
                  onClick={() => history.push(`/home/${item.name.split(" ")[0].toLowerCase()}`)}
                  button
                >
                  <ListItemIcon className={classes.list}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItem>
              )
            }
            <ListItem
              selected={location.pathname.includes('communities')}
              button
              onClick={toggleComm}
            >
              <ListItemIcon className={classes.list}><People/></ListItemIcon>
              <ListItemText primary="Communities"/>
              { openComm ? <ExpandLess/> : <ExpandMore/>}
            </ListItem>
            <Collapse in={openComm} timeout="auto" unmountOnExit>
              <List component="div" disablePadding dense>
                {
                  tags.map((tag, index) => 
                    <ListItem 
                      button 
                      onClick={() => history.push(`/home/communities/${tag}`)} 
                      selected={location.pathname.includes(tag)}
                      className={classes.nested} 
                      key={index}
                    >
                      <ListItemText primary={tag.split('_').join(' ')}/>
                    </ListItem>
                  )
                }
              </List>
            </Collapse>
          </List>
        </div>
      </Drawer>
      <main className={classes.content}>
        <Toolbar />
        <Grid container spacing={1} direction="row">
            <Routes />
        </Grid>
      </main>
      <Widget
        handleNewUserMessage={handleNewUserMessage}
        title='Coral'
        subtitle='Your companion for your journey through Ocean'
        showTimeStamp={false}
      />
    </div>
  );
}
