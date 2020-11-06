import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Chip, Select, InputLabel, Input } from '@material-ui/core'
import { MuiPickersUtilsProvider, KeyboardDatePicker } from '@material-ui/pickers'
import DateFnsUtils from '@date-io/date-fns'
import countries from '../../user/countries.json'
import { makeStyles } from '@material-ui/styles'
import Axios from 'axios';
import { useSnackbar } from 'notistack';
import { getCookie } from '../../../cookie/cookie'
import tags from '../Tags'

const useStyles = makeStyles(theme => ({
	chips: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 2,
    },
}))

const Edit = ({ user, setUser, toggle, edit }) => {

	const classes = useStyles();
	const cookie = getCookie("usertoken");
	const { enqueueSnackbar } = useSnackbar();
	const [details, setDetails] = useState(user)
	const [selectedTags, setSelectedTags] = useState(user.tags)

	const handleChange = (event) => {
		const et = event.target;
		if (!!et.id) {
			setDetails({ ...details, [et.id]: et.value })
		} else {
			setDetails({ ...details, [et.name]: et.value });
		}
	}

	const handleSubmit = e => {
		e.preventDefault();

		let detail_tags = "";
		selectedTags.forEach(tag => {detail_tags += tag + ' '})
		Axios.patch(
			"http://localhost:8000/api/user/profile/",
			{
				"first_name": details.first_name,
				"last_name": details.last_name,
				"dob": details.dob,
				"gender": details.gender,
				"country": details.country,
				"tags": detail_tags
			},
			{
				headers:
				{
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${cookie}`
				}
			}
		)
		.then(res => {
			enqueueSnackbar('Edited successfully!', { variant: 'success' });
			setUser({...user,
				"first_name": details.first_name,
				"last_name" : details.last_name,
				"dob": details.dob,
				"gender": details.gender,
				"country": details.country,
				"tags": detail_tags.split(' ').filter(str => str.length > 0)
			})
		})
		.catch(err => {
			enqueueSnackbar(err.message, { variant: 'error' });
		})

		toggle();

	}

	return (
		<Dialog
			aria-labelledby="form-dialog-title"
			open={edit}
			onClose={toggle}
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
						value={details.first_name}
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
						value={details.last_name}
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
							onChange={(d, v) => handleChange({ target: { id: "dob", value: v } })}
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
					{
						user.is_moderator ? null :
						<>
						<InputLabel id="tag" margin="normal">Communities</InputLabel>
						<Select
							id="tag"
							variant="outlined"
							multiline
							multiple
							value={selectedTags}
							onChange={e => setSelectedTags(e.target.value)}
							input={<Input id="select-multiple-chip"/>}
							fullWidth
							renderValue={selected => 
								<div className={classes.chips}>
								{
									selected.map(value => <Chip key={value} label={value.split('_').join(' ')} className={classes.chip}/>)
								}
								</div>
							}
						>
						{
							tags.map((name, index) => 
								<MenuItem key={index} value={name}>
									{name.split('_').join(' ')}
								</MenuItem>
							)
						}
						</Select>
						</>
					}
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