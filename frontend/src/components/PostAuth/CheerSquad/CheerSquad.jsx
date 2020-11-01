import React from 'react'
import { makeStyles } from '@material-ui/styles'
import { Card, TextField } from '@material-ui/core'

const useStyles = makeStyles(theme => ({

}))

export default function CheerSquad() {
    return(
        <TextField
          id="outlined-multiline-static"
          label="Multiline"
          multiline
          rows={4}
          defaultValue="Default Value"
          variant="outlined"
        />
    )
}