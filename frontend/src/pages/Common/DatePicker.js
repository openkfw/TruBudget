import React from "react";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import dayjs from "dayjs";
import DateFnsUtils from "@date-io/date-fns";
import { withStyles } from "@material-ui/core";

import strings from "../../localizeStrings";

const styles = {
  searchField: {
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  clearButton: {
    width: 35,
    height: 35,
    alignSelf: "flex-end",
    marginLeft: "5px"
  }
};

function DatePicker({ classes, name, label, onChange, onDelete, datetime, id = "default" }) {
  const dateFormat = strings.format.dateFormat;
  const datePlaceholder = strings.format.datePlaceholder;
  return (
    <div className={classes.searchField}>
      <form className={classes.form} noValidate>
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
          <KeyboardDatePicker
            autoOk
            variant="inline"
            id={id}
            label={label}
            placeholder={datePlaceholder}
            format={dateFormat}
            value={datetime}
            onChange={date => {
              onChange(dayjs(date).format("YYYY-MM-DD"), name);
            }}
            data-test={`datepicker-${id}`}
          />
        </MuiPickersUtilsProvider>
      </form>
      <IconButton data-test={`clear-datepicker-${id}`} onClick={onDelete} className={classes.clearButton}>
        <CancelIcon color="action" />
      </IconButton>
    </div>
  );
}

export default withStyles(styles)(DatePicker);
