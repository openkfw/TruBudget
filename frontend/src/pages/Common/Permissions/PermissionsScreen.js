import React, { Component } from 'react';

import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';

import strings from '../../../localizeStrings'


const styles = {
  container: {
    padding: 0
  },
  dialog: {
    paddingLeft: 0,
    paddingRight: 0,

  }
}

const PermissionsScreen = (props) => (
  <Dialog
    title="Set permissions for Project"
    actions={[
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={props.onCancel}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={true}
        onClick={props.onSubmit}
      />,
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
)

const tableStyle = {
  container: {}
}

const selectionStyle = {
  searchContainer: {
    marginLeft: '12px',
    marginRight: '12px'
  },
  selectionContainer: {
  }
}
class PermissionSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: ''
    }
  }

  render() {
    return (
      <SelectField
        multiple={true}
        hintText={`${this.props.permissions[this.props.name].length} selection(s)`}
        maxHeight={250}
        autoWidth={true}
        value={this.state.searchTerm}
        dropDownMenuProps={{
          onClose: () => this.setState({ searchTerm: '' })
        }}

      >
        <div style={selectionStyle.searchContainer}>
          <TextField
            fullWidth
            hintText="Search"
            onChange={(e) => this.setState({ searchTerm: e.target.value })} />
        </div>
        <div style={selectionStyle.selectionContainer}>
          {
            renderUserSelection(
              this.props.userList.filter(u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase())),
              this.props.permissions[this.props.name])
          }
        </div>
      </SelectField>
    )
  }
}

const renderUserSelection = (user, permission) => user.map(u => {
  return (
    <MenuItem
      key={u.id}
      insetChildren={true}
      checked={permission.indexOf(u.id) > -1}
      value={u.displayName}
      primaryText={u.displayName}
    />
  )
});

const renderPermission = (name, userList, permissions) => (
  <TableRow key={name}>
    <TableRowColumn>{strings.permissions[name] || name}</TableRowColumn>
    <TableRowColumn>
      <PermissionSelection name={name} userList={userList} permissions={permissions} />
    </TableRowColumn>
  </TableRow>
);



const PermissionsTable = ({ permissions, user }) => (
  <div style={tableStyle.container}>
    <Table>
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}
      >
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Permission</TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}>
        {
          Object.keys(permissions).map(p => renderPermission(p, user, permissions))
        }
      </TableBody>
    </Table>
  </div>
)

export default PermissionsScreen;
