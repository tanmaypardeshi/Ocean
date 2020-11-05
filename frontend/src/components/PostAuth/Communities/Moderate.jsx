import React from 'react';
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField} from '@material-ui/core';


const Moderate = ({id, deletepost, toggle}) => {
		const handleChange = () => {
	}
	return (
		<Dialog
		aria-labelledby="form-dialog-title" 
		open={deletepost}
		>

		<DialogTitle id="form-dialog-title">Enter your reason to delete this post</DialogTitle>
				<div>
					{id}
				</div>
				<form>
						<DialogContent>
								<TextField
								variant="outlined"
								margin="normal"
								id="first_name"
								label="Reason"
								type="text"
								autoComplete="Reason"
								onChange={handleChange}
								required fullWidth multiline
								rows={4}
								/>
						</DialogContent>
						<DialogActions>
								<Button autoFocus color="primary" onClick={toggle}>
								CANCEL
								</Button>
								<Button color="primary" type="submit">
								DELETE
								</Button>
						</DialogActions>
				</form>
		</Dialog>
	)
}

export default Moderate;