import React from 'react';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';


const getTableEntries = (workflowItems, location, history) => {
  return workflowItems.map((item, index) => {

    console.log('item ' + item)
    return (
      <TableRow key={index} >
        <TableRowColumn>{item.key}</TableRowColumn>
        <TableRowColumn>{item.status}</TableRowColumn>
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

const WorkflowTable = ({  history, location, workflowItems }) => {
  const tableEntries = getTableEntries(workflowItems, location, history);

  return (
    <Table>
      <TableHeader displaySelectAll={false}
        adjustForCheckbox={false}>

        <TableRow>
          <TableHeaderColumn>Workflow</TableHeaderColumn>
          <TableHeaderColumn>Status</TableHeaderColumn>
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
