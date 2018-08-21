import React from "react";

import Badge from "@material-ui/core/Badge";
import BubbleIcon from "@material-ui/icons/DeviceHub";
import { withStyles } from "@material-ui/core/styles";

import strings from "../../localizeStrings";
import Tooltip from "@material-ui/core/Tooltip";

const styles = theme =>({
  badge: {
    top: "-2px",
    right: "-2px",
    margin: theme.spacing.unit * 2,
  },
  margin: {
    margin: theme.spacing.unit * 2,
  },
});

const NumberOfPeersIcon = ({ numberOfActivePeers, classes }) => {
  return (
    <Badge className={classes.margin} badgeContent={numberOfActivePeers} color="primary">
     <Tooltip title={strings.navigation.connected_peers}>
        <BubbleIcon color="primary" />
    </Tooltip>
  </Badge>
  );
};

export default withStyles(styles)(NumberOfPeersIcon);
