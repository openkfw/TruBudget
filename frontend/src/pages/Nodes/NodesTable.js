import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { withStyles } from "@material-ui/core/styles";
import blueGrey from "@material-ui/core/colors/blueGrey";
import strings from "../../localizeStrings";

const styles = {
  paper: {
    marginTop: "40px"
  },
  title: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: "50px",
    alignItems: "center",
    backgroundColor: blueGrey[50]
  }
};

const groupBy = nodes => {
  return nodes.reduce((acc, node) => {
    if (node.currentAccess.accessType !== "none") {
      const key = node.address.organization;
      const index = acc.findIndex(x => x.organization === key);
      if (index === -1) {
        acc.push({ organization: key, count: 1, permissions: node.currentAccess.accessType });
      } else {
        acc[index].count += 1;
        acc[index].permissions = acc[index].permissions.concat(`, ${node.currentAccess.accessType}`);
      }
    }
    return acc;
  }, []);
};

const NodesTable = ({ nodes, classes }) => {
  const groupedNodes = groupBy(nodes);
  return (
    <Paper className={classes.paper}>
      <div className={classes.title}>
        <Typography variant="h6" color="primary" id="tableTitle">
          {strings.nodesDashboard.network}
        </Typography>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{strings.common.organization}</TableCell>
            <TableCell>{strings.nodesDashboard.nodes}</TableCell>
            <TableCell>{strings.nodesDashboard.access}</TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
};
export default withStyles(styles)(NodesTable);
