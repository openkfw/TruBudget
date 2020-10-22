import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";
import { NewOrganizationsEmptyState, ExistingNodesEmptyState } from "./NodesEmptyStates";

const styles = theme => ({
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  nodeCard: {
    width: "40%",
    paddingBottom: "20px"
  },
  card: {
    width: "48%",
    paddingBottom: "20px"
  },
  cardDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },

  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-around"
  },
  listItem: {
    display: "flex",
    flexDirection: "column"
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  button: {
    margin: theme.spacing(1)
  }
});

const splitNodes = nodes => {
  /*
   * The reduce function returns a two dimensional array,
   * which contains the user's own node, all nodes of new organizations
   * and all nodes of existing organizations.
   */
  return nodes.reduce(
    ([self, newOrgaNodes, existingOrgaNodes], node) => {
      const isOwnNode = node.currentAccess.accessType !== "none";

      if (isOwnNode) {
        return [[...self, node], newOrgaNodes, existingOrgaNodes];
      } else {
        const organizationExists = nodes.find(
          existingNode =>
            existingNode.address.organization === node.address.organization &&
            existingNode.address.address !== node.address.address
        );

        if (!organizationExists) {
          return [self, [...newOrgaNodes, node], existingOrgaNodes];
        } else {
          return [self, newOrgaNodes, [...existingOrgaNodes, node]];
        }
      }
    },
    [[], [], []]
  );
};

const getListEntries = (nodes, canApprove, classes, cb) => {
  return nodes.map(node => {
    return (
      <div key={node.address.address}>
        <ListItem key={node.address.address}>
          <ListItemText
            primary={
              <div className={classes.listItem}>
                <Typography variant="subtitle1"> {node.address.organization}</Typography>
              </div>
            }
            secondary={`${strings.nodesDashboard.address}: ${node.address.address}`}
          />
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            className={classes.button}
            onClick={() => cb(node.address)}
          >
            {strings.nodesDashboard.approve}
          </Button>
        </ListItem>
        <Divider />
      </div>
    );
  });
};

const NodeVoting = ({ nodes, approveNewNodeForExistingOrganization, allowedIntents, classes, isDataLoading }) => {
  const canApprove = canApproveNode(allowedIntents);

  const [, newOrgaNodes, existingOrgaNodes] = splitNodes(nodes);

  const newOrgaNodesListEntries = getListEntries(newOrgaNodes, canApprove, classes, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );
  const existingOrgaNodesListEntries = getListEntries(existingOrgaNodes, canApprove, classes, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.new_organization} />
        {isDataLoading ? (
          <div />
        ) : (
          <CardContent style={styles.cardContent}>
            <List>{newOrgaNodes.length ? newOrgaNodesListEntries : <NewOrganizationsEmptyState />}</List>
          </CardContent>
        )}
      </Card>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.additional_organization_node} />
        {isDataLoading ? (
          <div />
        ) : (
          <CardContent className={classes.cardContent}>
            <List>{existingOrgaNodes.length ? existingOrgaNodesListEntries : <ExistingNodesEmptyState />}</List>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default withStyles(styles)(NodeVoting);
