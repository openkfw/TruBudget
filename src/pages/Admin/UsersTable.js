import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import _ from 'lodash';

import { ACMECorpDarkBlue } from '../../colors';
import UsersDialog from './UsersDialog';

const getUsers = (users) => {
  const userArray = _.values(users);
  return userArray.map(user => {
    return (
      <TableRow key={ user.id }>
        <TableRowColumn>
          { user.id }
        </TableRowColumn>
        <TableRowColumn>
          { user.name }
        </TableRowColumn>
        <TableRowColumn>
          { user.role.organizationName }
        </TableRowColumn>
        <TableRowColumn>
          { user.role.roleName }
        </TableRowColumn>
      </TableRow>
    )
  })
}

const UsersTable = (props) => {
  const {users, roles, showUsersDialog} = props;
  const userEntries = getUsers(users);
  return (
    <div style={ { width: '100%', height: '500px', overflow: 'auto' } }>
      <Table fixedHeader={ true } selectable={ false }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn>Username</TableHeaderColumn>
            <TableHeaderColumn>Name</TableHeaderColumn>
            <TableHeaderColumn>Organization</TableHeaderColumn>
            <TableHeaderColumn>Role</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={ false } adjustForCheckbox={ false }>
          { userEntries }
        </TableBody>
      </Table>
      <div style={ { display: 'flex', flexDirection: 'column', position: 'absolute', alignItems: 'center', top: '16px', right: '-26px' } }>
        <FloatingActionButton backgroundColor={ ACMECorpDarkBlue } onTouchTap={ () => showUsersDialog() } style={ { position: 'relative' } }>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <UsersDialog {...props} />
    </div>

  )
}
export default UsersTable;