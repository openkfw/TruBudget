import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import React from "react";
import strings from "../../localizeStrings";
import { canApproveNode } from "../../permissions";
import { ExistingNodesEmptyState, NewOrganizationsEmptyState } from "./NodesEmptyStates";

const styles = {
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
    marginLeft: theme => theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme => theme.spacing(1)
  },
  button: {
    margin: theme => theme.spacing(1)
  }
};

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
            existingNode.address.address !== node.address.address &&
            existingNode.currentAccess.accessType !== "none"
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

const filterDeclinedNodes = (nodes, organization) => {
  return nodes.filter(node => {
    if (node.currentAccess.decliners.length > 0) {
      return node.currentAccess.decliners.forEach(declinerObject => {
        return declinerObject.organization !== organization;
      });
    } else return true;
  });
};

const getDeclinersString = decliners => {
  let resultString = "";
  let stringArray = [];
  if (decliners.length > 0) {
    decliners.forEach(declinerObject => {
      stringArray.push(declinerObject.organization);
    });
    resultString = `\n ${strings.nodesDashboard.declined_by}: ${stringArray.join(", ")}`;
  }
  return resultString;
};

const getListEntries = (nodes, canApprove, declineNode, approveNode) => {
  return nodes.map(node => {
    return (
      <div key={node.address.address}>
        <ListItem key={node.address.address}>
          <ListItemText
            primary={
              <div style={styles.listItem}>
                <Typography variant="subtitle1"> {node.address.organization}</Typography>
              </div>
            }
            secondary={
              <span component={"span"} variant="body2" style={styles.listItem}>
                <Typography variant="body2" display="block" component={"span"}>
                  {`${strings.nodesDashboard.address}: ${node.address.address} `}
                </Typography>
                <Typography variant="body2" display="block" component={"span"}>
                  {getDeclinersString(node.currentAccess.decliners)}
                </Typography>
              </span>
            }
          />
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            style={styles.button}
            onClick={() => approveNode(node.address)}
          >
            {strings.nodesDashboard.approve}
          </Button>
          <Button
            variant="contained"
            disabled={node.myVote !== "none" || !canApprove}
            color="primary"
            style={styles.button}
            onClick={() => declineNode(node.address)}
          >
            {strings.nodesDashboard.decline}
          </Button>
        </ListItem>
        <Divider />
      </div>
    );
  });
};

const NodeVoting = ({
  nodes,
  approveNewNodeForExistingOrganization,
  approveNewOrganization,
  allowedIntents,
  isDataLoading,
  organization,
  declineNode
}) => {
  const canApprove = canApproveNode(allowedIntents);
  const visibleNodes = filterDeclinedNodes(nodes, organization);

  const [, newOrgaNodes, existingOrgaNodes] = splitNodes(visibleNodes);

  const newOrgaNodesListEntries = getListEntries(newOrgaNodes, canApprove, declineNode, ({ organization }) =>
    approveNewOrganization(organization)
  );
  const existingOrgaNodesListEntries = getListEntries(existingOrgaNodes, canApprove, declineNode, ({ address }) =>
    approveNewNodeForExistingOrganization(address)
  );

  return (
    <div style={styles.container} data-test="node-voting">
      <Card style={styles.card}>
        <CardHeader title={strings.nodesDashboard.new_organization} />
        {isDataLoading ? (
          <div />
        ) : (
          <CardContent style={styles.cardContent}>
            <List>{newOrgaNodes.length ? newOrgaNodesListEntries : <NewOrganizationsEmptyState />}</List>
          </CardContent>
        )}
      </Card>
      <Card style={styles.card}>
        <CardHeader title={strings.nodesDashboard.additional_organization_node} />
        {isDataLoading ? (
          <div />
        ) : (
          <CardContent style={styles.cardContent}>
            <List>{existingOrgaNodes.length ? existingOrgaNodesListEntries : <ExistingNodesEmptyState />}</List>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default NodeVoting;
