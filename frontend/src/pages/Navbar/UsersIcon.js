import React from "react";

import Icon from "@material-ui/icons/Group";
import IconButton from "@material-ui/core/IconButton";

const UsersIcon = ({ history }) => (
  <IconButton disabled={true} onClick={() => history.push("/users")}>
    <Icon color="primary" />
  </IconButton>
);

export default UsersIcon;
