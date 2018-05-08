import React from "react";
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from "material-ui/Table";

const GroupsTable = () => (
  <Table>
    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
      <TableRow>
        <TableHeaderColumn>ID</TableHeaderColumn>
        <TableHeaderColumn>Organisation</TableHeaderColumn>
        <TableHeaderColumn>Name</TableHeaderColumn>
      </TableRow>
    </TableHeader>
    <TableBody displayRowCheckbox={false}>
      <TableRow selectable={false}>
        <TableRowColumn>1</TableRowColumn>
        <TableRowColumn>UmbrellaCorp</TableRowColumn>
        <TableRowColumn>GroupA</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>2</TableRowColumn>
        <TableRowColumn>Norwegian Minister of Climate</TableRowColumn>
        <TableRowColumn>GroupB</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>3</TableRowColumn>
        <TableRowColumn>ACMECorp</TableRowColumn>
        <TableRowColumn>GroupC</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>4</TableRowColumn>
        <TableRowColumn>Ughanda Ministry of Finance</TableRowColumn>
        <TableRowColumn>GroupD</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>4</TableRowColumn>
        <TableRowColumn>Ughanda Ministry of Finance</TableRowColumn>
        <TableRowColumn>GroupX</TableRowColumn>
      </TableRow>
    </TableBody>
  </Table>
);
export default GroupsTable;
