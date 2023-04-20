import React from "react";

import Backup from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";

import strings from "../../localizeStrings";

const styles = {
  button: {
    margin: (theme) => theme.spacing(1)
  },
  leftIcon: {
    marginRight: (theme) => theme.spacing(1)
  },
  iconSmall: {
    fontSize: 20
  }
};

const DownloadBackupButton = ({ createBackup }) => {
  return (
    <Button
      variant="contained"
      id="upload"
      color="primary"
      style={styles.button}
      data-test="download-backup"
      onClick={() => {
        createBackup();
      }}
    >
      <Backup style={{ ...styles.leftIcon, ...styles.iconSmall }} />
      {strings.common.download}
    </Button>
  );
};

export default DownloadBackupButton;
