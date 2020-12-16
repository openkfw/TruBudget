import React from "react";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import CancelIcon from "@material-ui/icons/Cancel";
import IconButton from "@material-ui/core/IconButton";
import { withStyles } from "@material-ui/core";
import _isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import DateFnsUtils from "@date-io/date-fns";

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
  const dateValue = _isEmpty(datetime) ? null : datetime;

  const handleOnBlur = (date, name) => {
    const modifiedDate = dayjs(date).isValid() ? dayjs(date).format("YYYY-MM-DD") : null;
    onChange(modifiedDate, name)
  }

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
            value={dateValue}
            onChange={date => {
              onChange(dayjs(date).format("YYYY-MM-DD"), name);
            }}
            onBlur={ date => handleOnBlur(date)}
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
