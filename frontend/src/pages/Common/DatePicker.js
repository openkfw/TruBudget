import React from "react";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core";

const styles = {
  form: {
    marginTop: "12px"
  }
};

function DatePicker({ classes, name, label, value = "", onChange, id = "default" }) {
  return (
    <form className={classes.form} noValidate>
      <TextField
        name={name}
        label={label}
        type="date"
        value={value}
        InputLabelProps={{
          shrink: true
        }}
        onChange={onChange}
        data-test={`datepicker-${id}`}
      />
    </form>
  );
}

export default withStyles(styles)(DatePicker);
