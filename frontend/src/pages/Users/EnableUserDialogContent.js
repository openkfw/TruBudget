import React from "react";

import InfoIcon from "@mui/icons-material/Info";
import { Typography } from "@mui/material";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";

const EnableUserDialog = (props) => {
  const { editId } = props;
  const dialogText = formatString(strings.users.enable_userId_confirm, editId);

  return (
    <div className="info-area">
      <InfoIcon className="info-icon" />
      <Typography variant="body2">{dialogText}</Typography>
    </div>
  );
};

export default EnableUserDialog;
