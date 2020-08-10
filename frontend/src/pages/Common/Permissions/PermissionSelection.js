import Checkbox from "@material-ui/core/Checkbox";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Typography from "@material-ui/core/Typography";
import Warning from "@material-ui/icons/Warning";
import _isEmpty from "lodash/isEmpty";
import React, { Component } from "react";

import strings from "../../../localizeStrings";

const renderSelection = (user, permissionedUser, intent, grant, revoke, myself, disabled) =>
  user.map(u => {
    const checked = permissionedUser.indexOf(u.id) > -1;
    return (
      <MenuItem
        disabled={(u.id === myself && checked) || disabled}
        key={u.id + "selection"}
        value={u.id}
        onClick={checked ? () => revoke(intent, u.id) : () => grant(intent, u.id)}
      >
        <Checkbox checked={checked} disabled={(u.id === myself && checked) || disabled} />
        <ListItemText primary={u.displayName} />
      </MenuItem>
    );
  });

class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  resolveSelections = (userList, permissions) => {
    if (_isEmpty(userList) || _isEmpty(permissions)) return [];

    return permissions.reduce((userdisplaynames, permission) => {
      const user = userList.find(u => u.id === permission);
      if (user) {
        userdisplaynames.push(user.displayName);
      }
      return userdisplaynames;
    }, []);
  };

  renderUserSelection = () => {
    const selection = renderSelection(
      this.props.userList.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
      ),
      this.props.permissions[this.props.name],
      this.props.name,
      this.props.grant,
      this.props.revoke,
      this.props.myself,
      this.props.disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader style={{ top: "auto" }}> {strings.users.users} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = () => {
    const selection = renderSelection(
      this.props.userList.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
      ),
      this.props.permissions[this.props.name],
      this.props.name,
      this.props.grant,
      this.props.revoke,
      this.props.myself,
      this.props.disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader style={{ top: "auto" }}> {strings.users.groups} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };
  render() {
    const selections = this.resolveSelections(this.props.userList, this.props.permissions[this.props.name]);
    const selectedUsers = this.renderUserSelection();

    const selectedGroups = this.renderGroupSelection();
    return (
      <FormControl data-test={`permission-select-${this.props.name}`} key={this.props.name + "form"}>
        <Select
          multiple
          style={{
            width: "350px"
          }}
          autoWidth
          value={selections}
          renderValue={s => s.join(", ")}
          MenuProps={{ "data-test": "permission-selection-popup" }}
        >
          {this.props.disabled ? (
            <ListSubheader
              className="noFocus"
              style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              component="div"
            >
              <Warning style={{ marginRight: "8px" }} />
              <Typography data-test="read-only-permissions-text" variant="caption">
                {strings.permissions.read_only}
              </Typography>
            </ListSubheader>
          ) : null}
          <ListItem className="noFocus" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FormControl data-test="permission-search">
              <InputLabel>{strings.common.search}</InputLabel>
              <Input value={this.state.searchTerm} onChange={e => this.setState({ searchTerm: e.target.value })} />
            </FormControl>
          </ListItem>
          <div data-test="permission-list" className="noFocus">
            {selectedUsers}
            {selectedGroups}
          </div>
        </Select>
      </FormControl>
    );
  }
}

export default PermissionSelection;
