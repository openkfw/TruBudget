import React from "react";

import InfoIcon from "@mui/icons-material/Info";
import { Typography } from "@mui/material";

import { formatString } from "../../helper";
import strings from "../../localizeStrings";

const styles = {
  infoArea: {
    display: "flex",
    flexDirection: "row",
    margin: "10px"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: "10px"
  }
};

const EnableUserDialog = (props) => {
  const { editId } = props;
  const dialogText = formatString(strings.users.enable_userId_confirm, editId);

  return (
    <div style={styles.infoArea}>
      <InfoIcon style={styles.infoIcon} />
      <Typography variant="body2">{dialogText}</Typography>
    </div>
  );
};

export default EnableUserDialog;
