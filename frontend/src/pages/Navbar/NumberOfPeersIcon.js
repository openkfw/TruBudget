import React from "react";

import BubbleIcon from "@mui/icons-material/DeviceHub";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";

const NumberOfPeersIcon = ({ numberOfActivePeers }) => {
  return (
    <Badge sx={{ margin: "10px" }} variant="dot" color={numberOfActivePeers > 0 ? "success" : "error"}>
      <Tooltip
        title={numberOfActivePeers > 0 ? strings.navigation.connected_peers : strings.navigation.disconnected_peers}
      >
        <BubbleIcon color="primary" />
      </Tooltip>
    </Badge>
  );
};

export default NumberOfPeersIcon;
