import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import InfoIcon from "@material-ui/icons/InfoOutline";
import { Icon } from "@material-ui/core";
import strings from "../../localizeStrings";

const groupBy = nodes => {
  return nodes.reduce((acc, node) => {
    const key = node.address.organization;
    const index = acc.findIndex(x => x.organization === key);
    if (index === -1) {
      acc.push({ organization: key, count: 1, permissions: node.currentAccess.accessType });
    } else {
      acc[index].count += 1;
      acc[index].permissions = acc[index].permissions.concat(`, ${node.currentAccess.accessType}`);
    }
    return acc;
  }, []);
};

const NodesTable = ({ nodes }) => {
  const groupedNodes = groupBy(nodes);
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>{strings.adminDashboard.organization}</TableCell>
          <TableCell>{strings.adminDashboard.nodes}</TableCell>
          <TableCell>{strings.adminDashboard.access}</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {groupedNodes.map(nodeGroup => {
          return (
            <TableRow key={nodeGroup.organization}>
              <TableCell component="th" scope="row">
                {nodeGroup.organization}
              </TableCell>
              <TableCell> {nodeGroup.count} </TableCell>
              <TableCell> {nodeGroup.permissions}</TableCell>
              <TableCell>
                <IconButton onClick={() => console.log("jow")}>
                  <InfoIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
export default NodesTable;
