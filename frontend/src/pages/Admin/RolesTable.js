import React from 'react';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import _ from 'lodash';

import { ACMECorpDarkBlue } from '../../colors';
import RolesDialog from './RolesDialog';
import strings from '../../localizeStrings';

const styles = {
  tableWrapper: {
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
        {strings.adminDashboard.organization}
      </TableHeaderColumn>
      <TableHeaderColumn>
        {strings.adminDashboard.id}
      </TableHeaderColumn>
      <TableHeaderColumn>
        {strings.adminDashboard.read}
      </TableHeaderColumn>
      <TableHeaderColumn>
        {strings.adminDashboard.write}
      </TableHeaderColumn>
      <TableHeaderColumn>
        {strings.adminDashboard.admin}
      </TableHeaderColumn>
    </TableRow>
  )
}


const getRoles = (roles) => {
  const sortedRoles = _.sortBy(roles, (role) => {
    return role.organization.toLowerCase()
  })
  return sortedRoles.map(role => {
    return (
      <TableRow key={role.role}>
        <TableRowColumn>
          {role.organization}
        </TableRowColumn>
        <TableRowColumn>
          {role.role}
        </TableRowColumn>
        <TableRowColumn>
          {role.read.toString()}
        </TableRowColumn>
        <TableRowColumn>
          {role.write.toString()}
        </TableRowColumn>
        <TableRowColumn>
          {role.admin.toString()}
        </TableRowColumn>
      </TableRow>
    )
  })

}


const RoleTable = (props) => {
  const { roles, showRolesDialog } = props;
  const headerColumns = getHeaderColumns();
  const tableEntries = getRoles(roles);
  return (
    <div style={styles.tableWrapper}>
      <Table selectable={false}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          {headerColumns}
        </TableHeader>
        <TableBody displayRowCheckbox={false} adjustForCheckbox={false}>
          {tableEntries}
        </TableBody>
      </Table>
      <div style={styles.buttonDiv}>
        <FloatingActionButton style={styles.actionButton} backgroundColor={ACMECorpDarkBlue} onTouchTap={() => showRolesDialog()}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
      <RolesDialog {...props} />
    </div>
  )
}
export default RoleTable;
