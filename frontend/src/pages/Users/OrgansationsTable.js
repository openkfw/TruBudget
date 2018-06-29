import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";

const OrganisationsTable = () => (
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>ID</TableCell>
        <TableCell>Name</TableCell>
        <TableCell>Country</TableCell>
      </TableRow>
    </TableHead>
    {/* <TableBody displayRowCheckbox={false}>
      <TableRow selectable={false}>
        <TableRowColumn>1</TableRowColumn>
        <TableRowColumn>UmbrellaCorp</TableRowColumn>
        <TableRowColumn>Brasil</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>2</TableRowColumn>
        <TableRowColumn>Norwegian Minister of Climate</TableRowColumn>
        <TableRowColumn>Norway</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>3</TableRowColumn>
        <TableRowColumn>ACMECorp</TableRowColumn>
        <TableRowColumn>Germany</TableRowColumn>
      </TableRow>
      <TableRow selectable={false}>
        <TableRowColumn>4</TableRowColumn>
        <TableRowColumn>Ughanda Ministry of Finance</TableRowColumn>
        <TableRowColumn>Ughanda</TableRowColumn>
      </TableRow>
    </TableBody>{" "} */}
    */}
  </Table>
);
export default OrganisationsTable;
