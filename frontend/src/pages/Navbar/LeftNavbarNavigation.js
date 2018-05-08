import React from "react";
import MenuIcon from "@material-ui/icons/Menu";
import IconButton from "material-ui/IconButton";

const LeftNavbarNavigation = ({ onToggleSidebar }) => {
  return (
    <div>
      <IconButton onClick={onToggleSidebar}>
        <MenuIcon color="primary" />
      </IconButton>
    </div>
  );
};

export default LeftNavbarNavigation;
