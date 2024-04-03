import React, { Component } from "react";
import _isEmpty from "lodash/isEmpty";

import CloseIcon from "@mui/icons-material/Close";
import Warning from "@mui/icons-material/Warning";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import strings from "../../../localizeStrings";
import ActionButton from "../ActionButton";
import OverflowTooltip from "../OverflowTooltip";

import "./PermissionSelection.scss";

const renderSelection = (user, permissionedUser, intent, grant, revoke, myself, disabled) =>
  user.map((u) => {
    const checked = permissionedUser.indexOf(u.id) > -1;
    return (
      <MenuItem
        disabled={(u.id === myself && checked) || disabled}
        key={u.id + "selection"}
        value={u.id}
        onClick={checked ? () => revoke(intent, u.id) : () => grant(intent, u.id)}
      >
        <Checkbox checked={checked} disabled={(u.id === myself && checked) || disabled} />
        <ListItemText className="name-container">
          <OverflowTooltip text={u.displayName} maxWidth="none" />
        </ListItemText>
      </MenuItem>
    );
  });

class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      selectIsOpen: false
    };
  }

  resolveSelections = (userList, permissions) => {
    if (_isEmpty(userList) || _isEmpty(permissions)) return [];

    return permissions.reduce((userdisplaynames, permission) => {
      const user = userList.find((u) => u.id === permission);
      if (user) {
        userdisplaynames.push(user.displayName);
      }
      return userdisplaynames;
    }, []);
  };

  renderUserSelection = () => {
    const selection = renderSelection(
      this.props.userList.filter(
        (u) => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
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
        <>
          <ListSubheader className="fix-label"> {strings.users.users} </ListSubheader>
          {selection}
        </>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = () => {
    const selection = renderSelection(
      this.props.userList.filter(
        (u) => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
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
        <>
          <ListSubheader className="fix-label"> {strings.users.groups} </ListSubheader>
          {selection}
        </>
      );
    } else {
      return null;
    }
  };
  render() {
    const selections = this.resolveSelections(this.props.userList, this.props.permissions[this.props.name]);
    const selectedUsers = this.renderUserSelection();
    const selectedGroups = this.renderGroupSelection();

    const openSelect = () => {
      if (this.props.onOpen !== undefined) this.props.onOpen();
      this.setState({ selectIsOpen: true });
    };

    const closeSelect = () => {
      this.setState({ searchTerm: "", selectIsOpen: false });
    };
    return (
      <FormControl data-test={`permission-select-${this.props.name}`} key={this.props.name + "form"}>
        <Select
          variant="standard"
          multiple
          className="select"
          autoWidth
          value={selections}
          renderValue={(s) => s.join(", ")}
          MenuProps={{ "data-test": "permission-selection-popup" }}
          open={this.state.selectIsOpen}
          onOpen={openSelect}
          onClose={closeSelect}
        >
          <div className="close-button-container">
            <ActionButton
              ariaLabel="close"
              data-test={"close-select"}
              onClick={closeSelect}
              title={strings.common.close}
              className="icon-button-style"
              icon={<CloseIcon className="close-button-size" />}
            />
          </div>
          {this.props.disabled ? (
            <ListSubheader className="warning-container" component="div">
              <Warning className="warning" />
              <Typography data-test="read-only-permissions-text" variant="caption">
                {strings.permissions.read_only}
              </Typography>
            </ListSubheader>
          ) : null}
          <div className="form-control-container">
            <FormControl data-test="permission-search">
              <InputLabel>{strings.common.search}</InputLabel>
              <Input value={this.state.searchTerm} onChange={(e) => this.setState({ searchTerm: e.target.value })} />
            </FormControl>
          </div>
          <div data-test="permission-list">
            <Paper className="item-container">
              <List>
                {selectedUsers}
                {selectedGroups}
              </List>
            </Paper>
          </div>
        </Select>
      </FormControl>
    );
  }
}

export default PermissionSelection;
