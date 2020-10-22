import React from "react";

import Badge from "@material-ui/core/Badge";
import BubbleIcon from "@material-ui/icons/DeviceHub";
import { withStyles } from "@material-ui/core/styles";
import Tooltip from "@material-ui/core/Tooltip";

import strings from "../../localizeStrings";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";

const styles = theme => ({
  connected: {
    backgroundColor: green[500]
  },
  disconnected: {
    backgroundColor: red[500]
  },
  margin: {
    margin: theme.spacing(2)
  }
});

const NumberOfPeersIcon = ({ numberOfActivePeers, classes }) => {
  return (
    <Badge
      classes={{ root: classes.margin, dot: numberOfActivePeers > 0 ? classes.connected : classes.disconnected }}
      variant="dot"
      color="primary"
    >
      <Tooltip
        title={numberOfActivePeers > 0 ? strings.navigation.connected_peers : strings.navigation.disconnected_peers}
      >
        <BubbleIcon color="primary" />
      </Tooltip>
    </Badge>
  );
};

export default withStyles(styles)(NumberOfPeersIcon);
