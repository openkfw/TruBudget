import React, { Component } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  formControl: {
    width: "100%"
  },
  checkbox: {
    height: 30
  }
};

class AssigneeSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  renderUsers(users, assigneeId, disabled) {
    return users.map(u => {
      const { id, displayName } = u;
      return (
        <MenuItem key={id} value={id}>
          <Checkbox style={styles.checkbox} disabled={disabled} checked={id === assigneeId} />
          {displayName}
        </MenuItem>
      );
    });
  }

  renderTitle(assignee) {
    if (!assignee) {
      return "...";
    }
    return assignee.id;
  }

  render() {
    const { assigneeId, users, disabled, classes } = this.props;

    const selection = this.renderUsers(
      users.filter(u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())),
      assigneeId,
      disabled
    );
    const assignee = users.find(user => user.id === assigneeId);

    return (
      <FormControl disabled={disabled} className={classes.formControl}>
        <Select
          classes={{ selectMenu: classes.selectMenu }}
          value={this.renderTitle(assignee)}
          onChange={event => (event.target.value !== assigneeId ? this.props.assign(event.target.value) : undefined)}
        >
          {selection}
        </Select>
      </FormControl>
    );
  }
}

export default withStyles(styles)(AssigneeSelection);
