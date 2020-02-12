import React from "react";

import Drawer from "@material-ui/core/Drawer";

import SideNavCard from "./SideNavCard";
import { canViewNodesDashboard } from "../../permissions";
import UserProfile from "./UserProfile";

const SideNav = props => {
  const {
    showSidebar,
    toggleSidebar,
    allowedIntents,
    organization,
    displayName,
    userProfileOpen,
    avatar,
    email,
    hideUserProfile,
    userProfileEdit,
    enableUserProfileEdit,
    disableUserProfileEdit,
    storeTempEmail,
    saveEmail,
    tempEmail,
    emailServiceAvailable,
    ...rest
  } = props;
  const nodeDashboardEnabled = canViewNodesDashboard(allowedIntents);
  return (
    <Drawer anchor="left" open={showSidebar} onClose={toggleSidebar}>
      <SideNavCard nodeDashboardEnabled={nodeDashboardEnabled} avatar={avatar} displayName={displayName} {...rest} />
      <UserProfile
        open={userProfileOpen}
        avatar={avatar}
        email={email}
        organization={organization}
        displayName={displayName}
        hideUserProfile={hideUserProfile}
        userProfileEdit={userProfileEdit}
        enableUserProfileEdit={enableUserProfileEdit}
        disableUserProfileEdit={disableUserProfileEdit}
        storeTempEmail={storeTempEmail}
        saveEmail={saveEmail}
        tempEmail={tempEmail}
        emailServiceAvailable={emailServiceAvailable}
      ></UserProfile>
    </Drawer>
  );
};

export default SideNav;
