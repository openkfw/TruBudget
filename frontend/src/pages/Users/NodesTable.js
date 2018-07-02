import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/InfoOutline";

const OrganisationsTable = ({ nodes }) => {
  console.log(nodes);
  return (
    <Table>
      <TableHead>
        <TableRow>
          {/* <TableCell /> */}
          <TableCell>Organization</TableCell>
          <TableCell>Address</TableCell>
          <TableCell>Access</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {nodes.map(node => {
          return (
            <TableRow key={node.address.address}>
              {/* <div style={{ display: "flex", width: "100%", justifyContent: "center" }}>
                <IconButton onClick={() => console.log("node clicked")}>
                  <InfoIcon />
                </IconButton>
              </div> */}
              <TableCell component="th" scope="row">
                {node.address.organization}
              </TableCell>
              <TableCell> {node.address.address} </TableCell>
              <TableCell> {node.currentAccess.accessType}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default OrganisationsTable;
