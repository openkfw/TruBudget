import React from "react";

import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";

const LeftNavbarNavigation = ({ toggleSidebar }) => {
  return (
    <div>
      <IconButton onClick={toggleSidebar} data-test="openSideNavbar">
        <MenuIcon color="primary" />
      </IconButton>
    </div>
  );
};

export default LeftNavbarNavigation;
