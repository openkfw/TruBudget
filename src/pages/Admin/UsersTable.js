import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,
} from 'material-ui/Table';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

import { ACMECorpDarkBlue } from '../../colors';

const getUsers = ({users}) => {
    return (
        <TableBody displayRowCheckbox={ false } adjustForCheckbox={ false }>
          <TableRow>
            <TableRowColumn>thouse</TableRowColumn>
            <TableRowColumn>Tom House</TableRowColumn>
            <TableRowColumn>moh_write</TableRowColumn>
            <TableRowColumn>/lego_avatar_male3.jpg</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>pkleffmann</TableRowColumn>
            <TableRowColumn>Piet Kleffmann</TableRowColumn>
            <TableRowColumn>ACMECorp_write</TableRowColumn>
            <TableRowColumn>/lego_avatar_male5.jpg</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>mstein</TableRowColumn>
            <TableRowColumn>Mauro Stein</TableRowColumn>
            <TableRowColumn>bndes_admin</TableRowColumn>
            <TableRowColumn>/lego_avatar_male5.jpg</TableRowColumn>
          </TableRow>
          <TableRow>
            <TableRowColumn>jxavier</TableRowColumn>
            <TableRowColumn>Jane Xavier</TableRowColumn>
            <TableRowColumn>moe_write</TableRowColumn>
            <TableRowColumn>/lego_avatar_female2.jpg</TableRowColumn>
          </TableRow>
        </TableBody>
    )
}

const UsersTable = (props) => {
    const userEntries = getUsers(props);
    return (
        <div style={ { width: '100%', height: '400px', overflow: 'auto' } }>
          <Table selectable={ false }>
            <TableHeader displaySelectAll={ false } adjustForCheckbox={ false }>
              <TableRow>
                <TableHeaderColumn>Username</TableHeaderColumn>
                <TableHeaderColumn>Name</TableHeaderColumn>
                <TableHeaderColumn>Role</TableHeaderColumn>
                <TableHeaderColumn>Avatar</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            { userEntries }
          </Table>
          <div style={ { display: 'flex', flexDirection: 'column', position: 'absolute', alignItems: 'center', top: '16px', right: '-26px' } }>
            <FloatingActionButton backgroundColor={ ACMECorpDarkBlue } onTouchTap={ () => console.log('hi') } style={ { position: 'relative' } }>
              <ContentAdd />
            </FloatingActionButton>
          </div>
        </div>
    )
}
export default UsersTable;