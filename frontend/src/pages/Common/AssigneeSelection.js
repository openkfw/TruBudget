import React, { Component } from "react";

import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import ListSubheader from "@material-ui/core/ListSubheader";

import strings from "../../localizeStrings";

const styles = {
  formControl: {
    width: "100%"
  },
  checkbox: {
    height: "10px"
  },
  selectValue: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  formControlContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  select: {
    "&$disabled": {
      cursor: "-webkit-grab"
    }
  },
  assigneeTypography: {
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  disabled: {}
};

class AssigneeSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  renderSelection(users, assigneeId, disabled) {
    return users.map(u => {
      const { id, displayName } = u;
      return (
        <MenuItem key={id} value={id} onClick={() => (id !== assigneeId ? this.props.assign(id) : undefined)}>
          <Checkbox style={styles.checkbox} disabled={disabled} checked={id === assigneeId} />
          <ListItemText primary={displayName} />
        </MenuItem>
      );
    });
  }

  renderTitle(assignee) {
    if (!assignee) {
      return ["..."];
    }
    return [assignee.displayName];
  }

  renderUserSelection = (users, assigneeId, disabled) => {
    const selection = this.renderSelection(
      users.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
      ),
      assigneeId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader> {strings.users.users} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = (users, assigneeId, disabled) => {
    const selection = this.renderSelection(
      users.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
      ),
      assigneeId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader> {strings.users.groups} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  render() {
    const { assigneeId, users, disabled, classes, workflowSortEnabled, status } = this.props;
    const suggestedUsers = this.renderUserSelection(users, assigneeId, disabled);
    const suggestedGroups = this.renderGroupSelection(users, assigneeId, disabled);
    const assignee = users.find(user => user.id === assigneeId);

    const getSortClasses = () => {
      if (workflowSortEnabled) {
        if (status !== "closed") {
          return {
            select: classes.select,
            disabled: classes.disabled
          };
        }
      }
      return;
    };

    return (
      <FormControl data-test="assignee-container" disabled={disabled} className={classes.formControl}>
        <Select
          data-test="assignee-selection"
          classes={{
            ...getSortClasses()
          }}
          value={this.renderTitle(assignee)}
          renderValue={s => (
            <div style={{ ...styles.selectValue }}>
              <Checkbox style={{ ...styles.checkbox }} disabled={disabled} checked={true} />
              <Typography disabled={disabled} variant="body1" style={styles.assigneeTypography}>
                {s}
              </Typography>
            </div>
          )}
          multiple
          onClose={() => this.setState({ searchTerm: "" })}
        >
          <div className="noFocus" style={styles.formControlContainer}>
            <FormControl>
              <InputLabel>{strings.common.search}</InputLabel>
              <Input value={this.state.searchTerm} onChange={e => this.setState({ searchTerm: e.target.value })} />
            </FormControl>
          </div>
          <div data-test="assignee-list">
            {suggestedUsers}
            {suggestedGroups}
          </div>
        </Select>
      </FormControl>
    );
  }
}

export default withStyles(styles)(AssigneeSelection);
