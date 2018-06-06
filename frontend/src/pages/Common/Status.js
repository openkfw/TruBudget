import React, { Component } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  formControl: {
    width: "70%"
  },
  checkbox: {
    height: 30
  }
};

class Status extends Component {
  renderStatus(status) {
    const predefinedStatus = ["Open", "Closed"];
    return predefinedStatus.map(s => {
      return (
        <MenuItem key={s} value={s}>
          <Checkbox style={styles.checkbox} checked={s === status} />
          {s}
        </MenuItem>
      );
    });
  }

  render() {
    const { status, close, classes } = this.props;
    const selection = this.renderStatus(status, true);
    const disabled = false;
    return (
      <FormControl disabled={disabled || "Closed" === status} className={classes.formControl}>
        <Select
          classes={{ selectMenu: classes.selectMenu }}
          value={status}
          onChange={event => (event.target.value !== status ? close() : undefined)}
        >
          {selection}
        </Select>
      </FormControl>
    );
  }
}

export default withStyles(styles)(Status);
