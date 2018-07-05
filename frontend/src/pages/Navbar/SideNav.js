import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewUserManagement } from "../../permissions";

const SideNav = props => {
  const { showSidebar, onToggleSidebar, allowedIntents, ...rest } = props;
  const userDashboardEnabled = canViewUserManagement(allowedIntents);

  return (
    <Drawer anchor="left" open={showSidebar} onClose={onToggleSidebar}>
      <SideNavCard userDashboardEnabled={userDashboardEnabled} {...rest} />
    </Drawer>
  );
};

export default SideNav;
