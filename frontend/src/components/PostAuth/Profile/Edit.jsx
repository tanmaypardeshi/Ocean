import React, { useEffect, useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Chip } from '@material-ui/core'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import countries from '../../user/countries.json'
import { makeStyles } from '@material-ui/styles'
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { useHistory } from 'react-router-dom'
import { getCookie } from '../../../cookie/cookie'

const useStyles = makeStyles(theme => ({
	chip: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    }
  }
}))

const Edit = ({first_name, last_name, gender, country, dob, toggle, edit}) => {
		const classes = useStyles();
		const history = useHistory();
		const cookie = getCookie("usertoken");
		const { enqueueSnackbar } = useSnackbar();
		const [details, setDetails] = useState({
			"first_name": "",
      "last_name": "",
      "dob": new Date().toISOString().slice(0,10),
      "gender": "",
      "country": "",
      "tags": ""
		})
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
			{selected: false, value:'relationship'},
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
			Axios.patch(
				"http://localhost:8000/api/user/profile/",
				details,
				{ 
					headers: 
					{ 
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${cookie}`
					} 
				}
			)
			.then(res => {
				console.log(res)
				enqueueSnackbar('Edited successfully!', { variant: 'success' });
				history.push('/home/profile');
			})
			.catch(err => {
				enqueueSnackbar(err.message, { variant: 'error' });
			})
        
        let detail_tags = "";
        tags.map(tag => { 
            if(tag.selected) {
                detail_tags += tag.value + " ";
            }
            return detail_tags;
        });
				setDetails({...details, tags: detail_tags.substring(0, detail_tags.length - 1)});
				
		}

		return (
				<Dialog
				aria-labelledby="form-dialog-title" 
				open={edit}
				>

					<DialogTitle id="form-dialog-title">Edit Your Profile Details</DialogTitle>
					<form onSubmit={handleSubmit}>
						<DialogContent>
								<TextField
									variant="outlined"
									// onChange= {handleChange}
									margin="normal"
									id="first_name"
									label="First Name"
									type="text"
									autoComplete="First Name"
									value={ details.first_name }
									onChange={handleChange}
									required fullWidth
								/>
								<TextField
									// onChange= {handleChange}
									variant="outlined"
									margin="normal"
									id="last_name"
									label="Last Name"
									type="text"
									autoComplete="Last Name"
									value={ details.last_name }
									onChange={handleChange}
									required fullWidth
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
							</DialogContent>
							<DialogActions>
								<Button autoFocus color="primary" onClick={toggle}>
									CANCEL
								</Button>
								<Button color="primary" type="submit">
									EDIT
								</Button>
							</DialogActions>
					</form>
				</Dialog>
    )
}

export default Edit;