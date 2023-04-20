import React from "react";

import PowerIcon from "@mui/icons-material/PowerSettingsNew";
import IconButton from "@mui/material/IconButton";

import strings from "../../localizeStrings";

const LogoutIcon = ({ history, logout }) => {
  return (
    <IconButton
      id="logoutbutton"
      data-test="navbar-logout-button"
      tooltip={strings.navigation.logout}
      onClick={() => {
        logout();
        history.push("/login");
      }}
      size="large"
    >
      <PowerIcon color="primary" />
    </IconButton>
  );
};

export default LogoutIcon;
