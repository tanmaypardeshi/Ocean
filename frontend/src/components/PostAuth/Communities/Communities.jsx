import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { TextField } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
  text : {

  }
}))

export default function Communities() {
    const classes = useStyles();
    return(
        <TextField className={classes.text}
          id="outlined-multiline-static"
          label="Multiline"
          multiline
          rows={4}
          defaultValue="Default Value"
          variant="outlined"
        />
    )
}