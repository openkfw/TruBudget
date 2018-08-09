import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewUserDashboard, canViewNodesDashboard } from "../../permissions";

const SideNav = props => {
  const { showSidebar, onToggleSidebar, allowedIntents, ...rest } = props;
  const userDashboardEnabled = canViewUserDashboard(allowedIntents);
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer anchor="left" open={showSidebar} onClose={onToggleSidebar}>
      <SideNavCard nodeDashboardEnabled={nodeDashboardEnabled} userDashboardEnabled={userDashboardEnabled} {...rest} />
    </Drawer>
  );
};

export default SideNav;
