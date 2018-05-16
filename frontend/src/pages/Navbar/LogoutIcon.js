import React from "react";

import IconButton from "@material-ui/core/IconButton";
import PowerIcon from "@material-ui/icons/PowerSettingsNew";

import strings from "../../localizeStrings";

const LogoutIcon = ({ history, logout }) => {
  return (
    <IconButton
      tooltip={strings.navigation.logout}
      onClick={() => {
        logout();
        history.push("/login");
      }}
    >
      <PowerIcon color="primary" />
    </IconButton>
  );
};

export default LogoutIcon;
