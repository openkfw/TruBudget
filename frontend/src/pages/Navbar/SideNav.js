import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewUserDashboard, canViewNodesDashboard, canViewGroupDashboard } from "../../permissions";

const SideNav = props => {
  const { showSidebar, onToggleSidebar, allowedIntents, ...rest } = props;
  const userDashboardEnabled = canViewUserDashboard(allowedIntents);
  const groupDashboardEnabled = canViewGroupDashboard(allowedIntents);
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer anchor="left" open={showSidebar} onClose={onToggleSidebar}>
      <SideNavCard
        nodeDashboardEnabled={nodeDashboardEnabled}
        userDashboardEnabled={userDashboardEnabled}
        groupDashboardEnabled={groupDashboardEnabled}
        {...rest}
      />
    </Drawer>
  );
};

export default SideNav;
