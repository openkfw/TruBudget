import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

const getTableEntries = (streamItems) => {
  console.log('StreamItems ' + streamItems)
  return streamItems.map((streamItem, index) => {
    console.log('Stream Item ' + streamItem);
    return (
      <TableRow key={index}>
        <TableRowColumn>{streamItem.name}</TableRowColumn>
        <TableRowColumn>{streamItem.confirmed}</TableRowColumn>
      </TableRow>
    );
  });
}

const WorkflowTable = (props) => {
  console.log("Props " + props.streamItems);
  const tableEntries = getTableEntries(props.streamItems);

  return (
    <Table>
    <TableHeader>
      <TableRow>
        <TableHeaderColumn>Name</TableHeaderColumn>
        <TableHeaderColumn>Confirmations</TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody>
      {tableEntries}
    </TableBody>
  </Table>
  )
}

export default WorkflowTable;
