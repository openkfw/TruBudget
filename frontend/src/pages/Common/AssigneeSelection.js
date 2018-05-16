import React, { Component } from "react";

import { MenuItem } from "material-ui/Menu";

import { FormControl, Checkbox } from "@material-ui/core";
import Select from "material-ui/Select";

const styles = {
  formControl: {
    marginLeft: 15
  },
  select: {
    width: 180
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
    const { assigneeId, users, disabled } = this.props;

    const selection = this.renderUsers(
      users.filter(u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())),
      assigneeId,
      disabled
    );
    const assignee = users.find(user => user.id === assigneeId);

    return (
      <FormControl disabled={disabled} style={styles.formControl}>
        <Select
          style={styles.select}
          value={this.renderTitle(assignee)}
          onChange={event => this.props.assign(event.target.value)}
        >
          {selection}
        </Select>
      </FormControl>
    );
  }
}

// TODO: update selectfield material v1
export default AssigneeSelection;
