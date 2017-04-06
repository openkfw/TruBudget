import React from 'react';
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

const getTableEntries = (streams) => {
  return streams.map((stream, index) => {
    return (
      <TableRow key={index}>
        <TableRowColumn>{stream.name}</TableRowColumn>
        <TableRowColumn>{stream.confirmed}</TableRowColumn>
      </TableRow>
    );
  });
}

const OverviewTable = (props) => {
  const tableEntries = getTableEntries(props.streams);

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

export default OverviewTable;