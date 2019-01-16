import React from "react";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";

const VersionsTable = ({versions}) => {
  let frontendVersion = "";
  let apiVersion = "";
  let bcVersion = "";
  let mcVersion = "";
  if (versions !== null) {
    frontendVersion = versions.frontend.release;
    apiVersion = versions.api.release;
    bcVersion = versions.blockchain.release;
    mcVersion = versions.multichain.release;
  }
  return (
    <Table >
      <TableBody>
        <TableRow>
          <TableCell data-test="frontendVersion" style={{ paddingRight: "4px"}} component="th" scope="row">
            frontend: {frontendVersion}
          </TableCell>
          <TableCell data-test="apiVersion" style={{ paddingRight: "4px"}}  component="th" scope="row">
            api: {apiVersion}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell data-test="blockchainVersion" style={{ paddingRight: "4px"}}  component="th" scope="row">
            blockchain: {bcVersion}
          </TableCell>
          <TableCell data-test="multichainVersion" style={{ paddingRight: "4px"}}  component="th" scope="row">
            multichain: {mcVersion}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default VersionsTable;
