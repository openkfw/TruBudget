import React from "react";
import TextField from "@material-ui/core/TextField";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import dayjs from "dayjs";
import { withStyles } from "@material-ui/core";

const styles = {
  searchField: {
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  button: {
    maxWidth: "30px",
    maxHeight: "30px",
    minWidth: "30px",
    minHeight: "30px",
    margin: "15px"
  }
};

function DatePicker({ classes, name, label, onChange, onDelete, datetime = "", id = "default" }) {
  dayjs(datetime).isValid() ? (datetime = dayjs(datetime).format("YYYY-MM-DD")) : (datetime = "");
  return (
    <div className={classes.searchField}>
      <form className={classes.form} noValidate>
        <TextField
          name={name}
          label={label}
          type="date"
          value={datetime}
          InputLabelProps={{
            shrink: true
          }}
          onChange={onChange}
          data-test={`datepicker-${id}`}
        />
      </form>
      <IconButton data-test={`clear-datepicker-${id}`} onClick={onDelete} className={classes.button}>
        <CancelIcon color="action" />
      </IconButton>
    </div>
  );
}

export default withStyles(styles)(DatePicker);
