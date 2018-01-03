import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { ACMECorpDarkBlue } from '../../colors';
import { showRolesDialog } from './actions';

const styles = {
  tableWrapper: {
    width: '100%',
    height: '400px',
    overflow: 'auto'
  },
  actionButton: {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    alignItems: 'center',
    top: '16px',
    right: '-26px'
  }
}

const getRoles = (roles) => {
  return (
    <TableBody displayRowCheckbox={ false } adjustForCheckbox={ false }>
      <TableRow>
        <TableRowColumn>Ministry of Finance</TableRowColumn>
        <TableRowColumn>mof_admin</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>false</TableRowColumn>
      </TableRow>
      <TableRow>
        <TableRowColumn>UmbrellaCorp</TableRowColumn>
        <TableRowColumn>bndes_admin</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
      </TableRow>
      <TableRow>
        <TableRowColumn>Centralbank</TableRowColumn>
        <TableRowColumn>centralbank_write</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>false</TableRowColumn>
      </TableRow>
      <TableRow>
        <TableRowColumn>Ministry of Health</TableRowColumn>
        <TableRowColumn>moh_write</TableRowColumn>
        <TableRowColumn>true</TableRowColumn>
        <TableRowColumn>false</TableRowColumn>
        <TableRowColumn>false</TableRowColumn>
      </TableRow>
    </TableBody>
  )
}


const RolesTable = (props) => {
  const {roles, showRolesDialog} = props
  const tableEntries = getRoles(roles)
  return (
    <div style={ styles.tableWrapper }>
      <Table selectable={ false }>
        <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableHeaderColumn>Organization</TableHeaderColumn>
            <TableHeaderColumn>ID</TableHeaderColumn>
            <TableHeaderColumn>Read</TableHeaderColumn>
            <TableHeaderColumn>Write</TableHeaderColumn>
            <TableHeaderColumn>Admin</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        { tableEntries }
      </Table>
      <div style={ styles.actionButton }>
        <FloatingActionButton style={ { position: 'relative' } } backgroundColor={ ACMECorpDarkBlue } onTouchTap={ () => showRolesDialog() }>
          <ContentAdd />
        </FloatingActionButton>
      </div>
    </div>
  )
}

export default RolesTable;