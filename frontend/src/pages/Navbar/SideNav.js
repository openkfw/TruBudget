import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewUserDashboard, canViewNodesDashboard } from "../../permissions";

const SideNav = props => {
  const { showSidebar, toggleSidebar, allowedIntents, ...rest } = props;
  const userDashboardEnabled = canViewUserDashboard(allowedIntents);
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer anchor="left" open={showSidebar} onClose={toggleSidebar}>
      <SideNavCard nodeDashboardEnabled={nodeDashboardEnabled} userDashboardEnabled={userDashboardEnabled} {...rest} />
    </Drawer>
  );
};

export default SideNav;
