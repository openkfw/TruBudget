import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";

import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core";

import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";

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
    marginLeft: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  }
});

const getNewNodesForExistingOrga = nodes => {
  return nodes
    .filter(node => node.currentAccess.accessType === "none")
    .filter(node =>
      nodes.find(
        x => x.address.organization === node.address.organization && x.address.address !== node.address.address
      )
    );
};

const getNewOrganizationNodes = nodes => {
  return nodes.filter(node => node.currentAccess.accessType === "none").filter(node => {
    const organizationExists = nodes.find(
      existingNode =>
        existingNode.address.organization === node.address.organization &&
        existingNode.address.address !== node.address.address
    );
    if (!organizationExists) {
      return node;
    }
    return undefined;
  });
};

const getListEntries = (newNodesForExistingOrga, canApprove, classes, cb) => {
  return newNodesForExistingOrga.map(node => {
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

const NodeVoting = ({
  showErrorSnackbar,
  storeSnackbarMessage,
  organization,
  showSnackbar,
  nodes,
  approveNewOrganization,
  approveNewNodeForExistingOrganization,
  allowedIntents,
  classes
}) => {
  const canApprove = canApproveNode(allowedIntents);
  const newNodesForExistingOrga = getNewNodesForExistingOrga(nodes);
  const nodesExistingOrga = getListEntries(newNodesForExistingOrga, canApprove, classes, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );

  const newOrganizationNodes = getNewOrganizationNodes(nodes);
  const nodesNewOrga = getListEntries(newOrganizationNodes, canApprove, classes, ({ organization }) =>
    approveNewOrganization(organization)
  );
  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.new_organization} />
        <CardContent style={styles.cardContent}>
          <List>{nodesNewOrga}</List>
        </CardContent>
      </Card>
      <Card className={classes.card}>
        <CardHeader title={strings.nodesDashboard.additional_organization_node} />
        <CardContent className={classes.cardContent}>
          <List>{nodesExistingOrga}</List>
        </CardContent>
      </Card>
    </div>
  );
};
export default withStyles(styles)(NodeVoting);
