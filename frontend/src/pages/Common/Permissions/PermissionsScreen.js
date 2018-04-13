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

const styles = {
  container: {

  }
}

const PermissionsScreen = (props) => (
  <div style={styles.container}>
    <h1>test</h1>
    <PermissionsTable {...props} />
  </div>
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
    <TableRowColumn>{name}</TableRowColumn>
    <TableRowColumn>
      <PermissionSelection name={name} userList={userList} permissions={permissions} />
    </TableRowColumn>
  </TableRow>
);



const PermissionsTable = ({ permissions, user }) => (
  <div style={tableStyle.container}>
    <Table
      fixedHeader
      fixedFooter
    >
      <TableHeader
        displaySelectAll={false}
        adjustForCheckbox={false}
      >
        <TableRow>
          <TableHeaderColumn colSpan="2" tooltip="Super Header" style={{ textAlign: 'center' }}>
            Super Header
          </TableHeaderColumn>
        </TableRow>
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
      <TableFooter adjustForCheckbox={false}>
        <TableRow>
          <TableHeaderColumn>Name</TableHeaderColumn>
          <TableHeaderColumn>Permission</TableHeaderColumn>
        </TableRow>
      </TableFooter>
    </Table>
  </div>
)

export default PermissionsScreen;
