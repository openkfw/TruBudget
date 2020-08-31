import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewNodesDashboard } from "../../permissions";
import UserProfile from "./UserProfile";

const SideNav = props => {
  const { showSidebar, toggleSidebar, allowedIntents, ...rest } = props;
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer
      ModalProps={{ BackdropProps: { "data-test": "sidenav-drawer-backdrop" } }}
      anchor="left"
      open={showSidebar}
      onClose={toggleSidebar}
    >
      <SideNavCard nodeDashboardEnabled={nodeDashboardEnabled} {...rest} />
      <UserProfile {...props} />
    </Drawer>
  );
};

export default SideNav;
