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
import { DeclinedNodesEmptyState } from "./NodesEmptyStates";

const styles = theme => ({
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  card: {
    width: "48%",
    paddingBottom: "20px"
  },
  listItem: {
    display: "flex",
    flexDirection: "column"
  }
});

const filterDeclinedNodes = (nodes, organization) => {
  return nodes.filter(node => {
    if (node.currentAccess.decliners.length > 0) {
      return !node.currentAccess.decliners.forEach(declinerObject => {
        return declinerObject.organization === organization;
      });
    } else return false;
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

const getListEntries = (declinedNodes, classes) => {
  return declinedNodes.map(node => {
    return (
      <div key={node.address.address}>
        <ListItem key={node.address.address}>
          <ListItemText
            primary={
              <div className={classes.listItem}>
                <Typography variant="subtitle1"> {node.address.organization}</Typography>
              </div>
            }
            secondary={
              <span className={classes.listItem}>
                <Typography variant="body2" display="block" component={"span"}>
                  {`${strings.nodesDashboard.address}: ${node.address.address} `}
                </Typography>
                <Typography variant="body2" display="block" component={"span"}>
                  {getDeclinersString(node.currentAccess.decliners)}
                </Typography>
              </span>
            }
          />
        </ListItem>
        <Divider />
      </div>
    );
  });
};

const DeclinedNodesTable = ({ nodes, allowedIntents, classes, isDataLoading, organization }) => {
  const canApprove = canApproveNode(allowedIntents);
  const declinedNodes = filterDeclinedNodes(nodes, organization);

  const declinedNodesListEntries = getListEntries(declinedNodes, canApprove, classes);

  return (
    <div className={classes.container}>
      <Card className={classes.card}>
        <CardHeader title={`${strings.nodesDashboard.declined_by} ${organization} `} />
        {isDataLoading ? (
          <div />
        ) : (
          <CardContent style={styles.cardContent}>
            <List>{declinedNodes.length ? declinedNodesListEntries : <DeclinedNodesEmptyState />}</List>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default withStyles(styles)(DeclinedNodesTable);
