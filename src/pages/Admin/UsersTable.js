import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import _ from 'lodash';

import { ACMECorpDarkBlue } from '../../colors';
import UsersDialog from './UsersDialog';
import strings from '../../localizeStrings';

const styles = {
  container: {
    width: '100%',
    height: '700px',
    overflow: 'auto'
  },
  buttonDiv: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    alignItems: 'center',
    top: '16px',
    right: '-26px'
  },
  actionButton: {
    position: 'relative'
  }
}


const getHeaderColumns = () => {
  return (
    <TableRow>
      <TableHeaderColumn>
        { strings.common.username }
      </TableHeaderColumn>
      <TableHeaderColumn>
        { strings.adminDashboard.name }
      </TableHeaderColumn>
      <TableHeaderColumn>
        { strings.adminDashboard.organization }
      </TableHeaderColumn>
      <TableHeaderColumn>
        { strings.adminDashboard.role }
      </TableHeaderColumn>
    </TableRow>
  )
}
const sortUsers = (users) => {
  const userArray = _.values(users);
  const sortedUsers = _.sortBy(userArray, user => {
    return user.organization.toLowerCase()
  }
  );
  return sortedUsers;
}

const getUsers = (users) => {
  const sortedUsers = sortUsers(users);
  return sortedUsers.map(user => {
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
  const {users, showUsersDialog} = props;
  const headerColumns = getHeaderColumns();
  const userEntries = getUsers(users);

  return (
    <div style={ styles.container }>
      <Table fixedHeader={ true } selectable={ false }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          { headerColumns }
        </TableHeader>
        <TableBody displayRowCheckbox={ false } adjustForCheckbox={ false }>
          { userEntries }
        </TableBody>
      </Table>
      <div style={ styles.buttonDiv }>
        <FloatingActionButton style={ styles.actionButton } backgroundColor={ ACMECorpDarkBlue } onTouchTap={ () => showUsersDialog() }>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <UsersDialog {...props} />
    </div>

  )
}
export default UsersTable;