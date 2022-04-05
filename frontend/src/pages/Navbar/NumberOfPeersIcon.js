import React from "react";

import Badge from "@mui/material/Badge";
import BubbleIcon from "@mui/icons-material/DeviceHub";
import { withStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";
import green from "@mui/material/colors/green";
import red from "@mui/material/colors/red";

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
