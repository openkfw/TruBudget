import React from "react";
import Button from "@mui/material/Button";
import { withStyles } from "@mui/styles";
import Backup from "@mui/icons-material/CloudDownload";
import strings from "../../localizeStrings";

const styles = theme => ({
  button: {
    margin: theme.spacing(1)
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  iconSmall: {
    fontSize: 20
  }
});

const DownloadBackupButton = ({ createBackup, classes }) => {
  return (
    <Button
      variant="contained"
      id="upload"
      color="primary"
      className={classes.button}
      data-test="download-backup"
      onClick={() => {
        createBackup();
      }}
    >
      <Backup className={`${classes.leftIcon} ${classes.iconSmall}`} />
      {strings.common.download}
    </Button>
  );
};

export default withStyles(styles)(DownloadBackupButton);
