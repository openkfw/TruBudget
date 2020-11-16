import Radio from "@material-ui/core/Radio";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { Component } from "react";

import strings from "../../localizeStrings";
import { Checkbox } from "@material-ui/core";

const styles = {
  formControl: {
    width: "100%"
  },
  radioButton: {
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
  listSubHeader: { top: "auto" },
  disabled: {}
};

class AssigneeSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      selectIsOpen: false
    };
  }

  renderSelection(users, assigneeId, disabled) {
    return users.map(u => {
      const { id, displayName } = u;
      return (
        <MenuItem
          key={id}
          value={id}
          onClick={() => (id !== assigneeId ? this.props.assign(id, displayName) : undefined)}
        >
          <Radio style={styles.radioButton} disabled={disabled} checked={id === assigneeId} />
          <ListItemText data-test="assignee-name" primary={displayName} />
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
          <ListSubheader style={styles.listSubHeader}> {strings.users.users} </ListSubheader>
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
          <ListSubheader style={styles.listSubHeader}> {strings.users.groups} </ListSubheader>
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

    const openSelect = () => {
      if (this.props.onOpen !== undefined) this.props.onOpen();
      this.setState({ selectIsOpen: true });
    };

    return (
      <FormControl
        data-test={"assignee-container" + (disabled ? "-disabled" : "")}
        disabled={disabled}
        className={classes.formControl}
      >
        <Select
          data-test={"assignee-selection" + (disabled ? "-disabled" : "")}
          classes={{
            ...getSortClasses()
          }}
          value={this.renderTitle(assignee)}
          renderValue={s => (
            <div style={{ ...styles.selectValue }}>
              <Checkbox style={{ ...styles.radioButton }} disabled={disabled} checked={true} />
              <Typography disabled={disabled} variant="body1" style={styles.assigneeTypography}>
                {s}
              </Typography>
            </div>
          )}
          multiple
          open={this.state.selectIsOpen}
          onOpen={openSelect}
          onClose={() =>
            this.setState(_state => {
              return { searchTerm: "", selectIsOpen: false };
            })
          }
        >
          <div className="noFocus" style={styles.formControlContainer}>
            <FormControl>
              <InputLabel>{strings.common.search}</InputLabel>
              <Input
                inputProps={{ "data-test": "search-assignee-field" }}
                value={this.state.searchTerm}
                onChange={e => this.setState({ searchTerm: e.target.value })}
              />
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
