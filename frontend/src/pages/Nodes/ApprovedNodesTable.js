import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import Paper from "@material-ui/core/Paper";
import strings from "../../localizeStrings";
import ApprovedNodestableEntry from "./ApprovedNodestableEntry";

const styles = {
    container: {
        width: "100%",
        display: "flex",
        justifyContent: "center"
    },
    customWidth: {
        width: "100%",
        marginTop: "40px"
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

const ApprovedNodesTable = props => {
    const { nodes } = props;
    const groupedNodes = groupBy(nodes);

    return (
        <Paper data-test="approved-nodes-table">
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell />
                        <TableCell>{strings.common.organization}</TableCell>
                        <TableCell>{strings.nodesDashboard.nodes}</TableCell>
                        <TableCell>{strings.nodesDashboard.access}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody data-test="approved-nodes-table-body">
                    {groupedNodes.map(nodeGroup => {
                        return (
                            <ApprovedNodestableEntry key={nodeGroup.organization} nodeGroup={nodeGroup} nodes={nodes} />
                        );
                    })}
                </TableBody>
            </Table>
        </Paper>
    );
};

export default withStyles(styles)(ApprovedNodesTable);

