import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';

const tableData = [
  {
    name: 'John Smith',
    status: 'Employed',
  },
  {
    name: 'Randal White',
    status: 'Unemployed',
  },
  {
    name: 'Stephanie Sanders',
    status: 'Employed',
    selected: true,
  },
  {
    name: 'Steve Brown',
    status: 'Employed',
  },
  {
    name: 'Joyce Whitten',
    status: 'Employed',
  },
  {
    name: 'Samuel Roberts',
    status: 'Employed',
  },
  {
    name: 'Adam Moore',
    status: 'Employed',
  },
];

const getTableEntries = (streamItems, location, history) => {
  return streamItems.map((tableData, index) => {
  //  var time = new Date(streamItem.time * 1000)
    return (
      <TableRow key={index} selectable={false}>
        <TableRowColumn>{tableData.name}</TableRowColumn>
        <TableRowColumn>{tableData.status}</TableRowColumn>
        <TableRowColumn>
        <IconMenu
    iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
    anchorOrigin={{horizontal: 'left', vertical: 'top'}}
    targetOrigin={{horizontal: 'left', vertical: 'top'}}
  >
    <MenuItem primaryText="Edit" />
    <MenuItem primaryText="Close" />
  </IconMenu>
        </TableRowColumn>
      </TableRow>
    );
  });
}

const WorkflowTable = ({  history, location }) => {
  const tableEntries = getTableEntries(tableData, location, history);

  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>

        <TableRow>
          <TableHeaderColumn>Sub-Project</TableHeaderColumn>
          <TableHeaderColumn>Open </TableHeaderColumn>
          <TableHeaderColumn> </TableHeaderColumn>
          <TableHeaderColumn> </TableHeaderColumn>
        </TableRow>
      </TableHeader>
      <TableBody displayRowCheckbox={false}
        adjustForCheckbox={false}>

        {tableEntries}
      </TableBody>
    </Table>
  )
}

export default WorkflowTable;
