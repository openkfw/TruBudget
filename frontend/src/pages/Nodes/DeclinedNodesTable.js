import React from "react";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import strings from "../../localizeStrings";

const filterDeclinedNodes = (nodes, organization) => {
  return nodes.filter((node) => {
    if (node.currentAccess.decliners.length > 0) {
      return !node.currentAccess.decliners.forEach((declinerObject) => {
        return declinerObject.organization === organization;
      });
    } else return false;
  });
};

const getDeclinersString = (decliners) => {
  let resultString = "";
  let stringArray = [];
  if (decliners.length > 0) {
    decliners.forEach((declinerObject) => {
      stringArray.push(declinerObject.organization);
    });
    resultString = `${stringArray.join(", ")}`;
  }
  return resultString;
};

const getListEntries = (declinedNodes) => {
  if (declinedNodes.length) {
    return declinedNodes.map((node) => {
      return (
        <TableRow key={node.address.address}>
          <TableCell align="right">{node.address.organization}</TableCell>
          <TableCell align="center">{node.address.address}</TableCell>
          <TableCell align="left">{getDeclinersString(node.currentAccess.decliners)}</TableCell>
        </TableRow>
      );
    });
  }
};

const DeclinedNodesTable = (props) => {
  const { nodes, organization } = props;
  const declinedNodes = filterDeclinedNodes(nodes, organization);
  const declinedNodesListEntries = getListEntries(declinedNodes);

  return (
    <Paper data-test="declined-nodes-table">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="right">{strings.common.organization}</TableCell>
            <TableCell align="center">{strings.nodesDashboard.nodes}</TableCell>
            <TableCell align="left">{strings.nodesDashboard.declined_by}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody data-test="declined-nodes-table-body">{declinedNodesListEntries}</TableBody>
      </Table>
    </Paper>
  );
};

export default DeclinedNodesTable;
