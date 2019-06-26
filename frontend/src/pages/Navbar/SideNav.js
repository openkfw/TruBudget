import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewNodesDashboard } from "../../permissions";

const SideNav = props => {
  const { showSidebar, toggleSidebar, allowedIntents, ...rest } = props;
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer anchor="left" open={showSidebar} onClose={toggleSidebar}>
      <SideNavCard nodeDashboardEnabled={nodeDashboardEnabled} {...rest} />
    </Drawer>
  );
};

export default SideNav;
