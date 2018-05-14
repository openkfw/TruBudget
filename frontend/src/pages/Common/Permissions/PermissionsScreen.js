import React, { Component } from "react";

import Table, { TableBody, TableHead, TableCell, TableRow } from "material-ui/Table";

import { MenuItem } from "material-ui/Menu";
import Select from "material-ui/Select";
import Input, { InputLabel } from "material-ui/Input";
import { FormControl } from "material-ui/Form";
import { ListItemText } from "material-ui/List";
import Checkbox from "material-ui/Checkbox";

import TextField from "material-ui/TextField";
import Dialog, { DialogActions, DialogContent, DialogTitle } from "material-ui/Dialog";

import Button from "material-ui/Button";

import strings from "../../../localizeStrings";

const styles = {
  container: {
    padding: 0
  },
  dialog: {
    paddingLeft: 0,
    paddingRight: 0
  },
  tableRow: {
    borderWidth: 0
  },
  heading: {
    textAlign: "center",
    fontSize: "14px",
    verticalAlign: "bottom",
    paddingBottom: "8px"
  }
};

const PermissionsScreen = props => (
  <Dialog disableBackdropClick disableEscapeKeyDown maxWidth={false} open={props.show} fullWidth style={styles.dialog}>
    <DialogTitle>{props.title}</DialogTitle>
    <DialogContent>
      <div style={styles.container}>
        <PermissionsTable {...props} />
      </div>
    </DialogContent>
    <DialogActions>
      <Button color="primary" onClick={props.onClose}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

const tableStyle = {
  container: {}
};

const selectionStyle = {
  searchContainer: {
    marginLeft: "12px",
    marginRight: "12px"
  },
  selectionContainer: {}
};
class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ""
    };
  }

  resolveSelectionTitle = () => {
    const userListAvailable = this.props.userList.length > 0;

    if (!userListAvailable) {
      return `...`;
    }
    return `${this.props.permissions[this.props.name].length} selection(s)`;
  };

  render() {
    return (
      <FormControl>
        <InputLabel htmlFor={`${this.props.name}-selection`}>{this.resolveSelectionTitle()}</InputLabel>
        <Select
          multiple
          style={{ width: "200px" }}
          autoWidth
          value={this.props.permissions[this.props.name]}
          input={<Input id={`${this.props.name}-selection`} />}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: 200,
                width: 250
              }
            }
            // onClose: () => this.setState({ searchTerm: "" })
          }}
        >
          {/* <div style={selectionStyle.searchContainer}>
          <TextField fullWidth hintText="Search" onChange={e => this.setState({ searchTerm: e.target.value })} />
        </div> */}
          <div style={selectionStyle.selectionContainer}>
            {renderUserSelection(
              this.props.userList.filter(u =>
                u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())
              ),
              this.props.permissions[this.props.name],
              this.props.name,
              this.props.grantPermission
            )}
          </div>
        </Select>
      </FormControl>
    );
  }
}

const renderUserSelection = (user, permissionedUser, permissionName, grantPermission) =>
  user.map(u => {
    return (
      <MenuItem key={u.id} value={u.id} onClick={() => grantPermission(permissionName, u.id)}>
        <Checkbox checked={permissionedUser.indexOf(u.id) > -1} />
        <ListItemText primary={u.displayName} />
      </MenuItem>
    );
  });

const renderPermission = (name, userList, permissions, grantPermission) => (
  <TableRow key={name} style={styles.tableRow}>
    <TableCell>{strings.permissions[name.replace(/[.]/g, "_")] || name}</TableCell>
    <TableCell>
      <PermissionSelection
        name={name}
        userList={userList}
        permissions={permissions}
        grantPermission={grantPermission}
      />
    </TableCell>
  </TableRow>
);

const PermissionsTable = ({ permissions, user, grantPermission, id, intentOrder }) => (
  <div style={tableStyle.container}>
    {intentOrder.map(section => {
      return (
        <Table key={strings.permissions[section.name]}>
          <TableHead>
            <TableRow>
              <TableCell colSpan="3" style={styles.heading}>
                {strings.permissions[section.name]}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {section.intents
              .filter(i => permissions[i] !== undefined)
              .map(p => renderPermission(p, user, permissions, grantPermission.bind(this, id)))}
          </TableBody>
        </Table>
      );
    })}
  </div>
);

export default PermissionsScreen;
