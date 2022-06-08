import React from "react";
import { DatePicker as DatePickerMui } from "@mui/lab";
import CancelIcon from "@mui/icons-material/Cancel";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { withStyles } from "@mui/styles";
import _isEmpty from "lodash/isEmpty";
import dayjs from "dayjs";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
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
    onChange(modifiedDate, name);
  };

  return (
    <div className={classes.searchField}>
      <form className={classes.form} noValidate>
        <div data-test={`datepicker-${id}`}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePickerMui
              autoOk
              variant="standard"
              id={id}
              label={label}
              placeholder={datePlaceholder}
              inputFormat={dateFormat}
              value={dateValue}
              onChange={date => {
                onChange(dayjs(date).format("YYYY-MM-DD"), name);
              }}
              onBlur={date => handleOnBlur(date)}
              renderInput={params => <TextField variant="standard" {...params} />}
            />
          </LocalizationProvider>
        </div>
      </form>
      <IconButton data-test={`clear-datepicker-${id}`} onClick={onDelete} className={classes.clearButton} size="large">
        <CancelIcon color="action" />
      </IconButton>
    </div>
  );
}

export default withStyles(styles)(DatePicker);
