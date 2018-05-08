import React, { Component } from "react";

import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table";

import { MenuItem } from "material-ui/Menu";

import TextField from "material-ui/TextField";
import Dialog from "material-ui/Dialog";

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
  <Dialog
    title={props.title}
    actions={[
      <Button primary={true} onClick={props.onClose}>
        Close
      </Button>
    ]}
    modal={true}
    open={props.show}
    autoScrollBodyContent={true}
    bodyStyle={styles.dialog}
  >
    <div style={styles.container}>
      <PermissionsTable {...props} />
    </div>
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
    return null;
    // TODO: update select field material v1

    // <SelectField
    //   multiple={true}
    //   hintText={this.resolveSelectionTitle()}
    //   maxHeight={250}
    //   autoWidth={true}
    //   dropDownMenuProps={{
    //     onClose: () => this.setState({ searchTerm: "" })
    //   }}
    // >
    //   <div style={selectionStyle.searchContainer}>
    //     <TextField fullWidth hintText="Search" onChange={e => this.setState({ searchTerm: e.target.value })} />
    //   </div>
    //   <div style={selectionStyle.selectionContainer}>
    //     {renderUserSelection(
    //       this.props.userList.filter(u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())),
    //       this.props.permissions[this.props.name],
    //       this.props.name,
    //       this.props.grantPermission
    //     )}
    //   </div>
    // </SelectField>
  }
}

const renderUserSelection = (user, permissionedUser, permissionName, grantPermission) =>
  user.map(u => {
    return (
      <MenuItem
        key={u.id}
        insetChildren={true}
        checked={permissionedUser.indexOf(u.id) > -1}
        value={u.displayName}
        primaryText={u.displayName}
        onClick={() => grantPermission(permissionName, u.id)}
      />
    );
  });

const renderPermission = (name, userList, permissions, grantPermission) => (
  <TableRow key={name} style={styles.tableRow}>
    <TableRowColumn>{strings.permissions[name.replace(/[.]/g, "_")] || name}</TableRowColumn>
    <TableRowColumn>
      <PermissionSelection
        name={name}
        userList={userList}
        permissions={permissions}
        grantPermission={grantPermission}
      />
    </TableRowColumn>
  </TableRow>
);

const PermissionsTable = ({ permissions, user, grantPermission, id, intentOrder }) => (
  <div style={tableStyle.container}>
    {intentOrder.map(section => {
      return (
        <Table key={strings.permissions[section.name]} selectable={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              <TableHeaderColumn colSpan="3" style={styles.heading}>
                {strings.permissions[section.name]}
              </TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false}>
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
