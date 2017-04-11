import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

const getTableEntries = (streamItems) => {
  console.log('StreamItems ' + streamItems)
  return streamItems.map((streamItem, index) => {
    console.log('Stream Item ' + streamItem);
    var time = new Date(streamItem.timereceived * 1000)
    return (
      <TableRow key={index}>
        <TableRowColumn>{streamItem.key}</TableRowColumn>
        <TableRowColumn>{time.toString()}</TableRowColumn>
      </TableRow>
    );
  });
}

const WorkflowTable = (props) => {
  console.log("Props " + props.streamItems);
  const tableEntries = getTableEntries(props.streamItems);

  return (
    <Table>
    <TableHeader displaySelectAll={false}
              adjustForCheckbox={false}>
      <TableRow>
        <TableHeaderColumn>Key</TableHeaderColumn>
        <TableHeaderColumn>Time</TableHeaderColumn>
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
