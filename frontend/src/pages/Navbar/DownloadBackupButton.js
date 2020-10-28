import React from "react";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Backup from "@material-ui/icons/CloudDownload";
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
