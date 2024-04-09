import React from "react";

import Backup from "@mui/icons-material/CloudDownload";
import Button from "@mui/material/Button";

import strings from "../../localizeStrings";

const DownloadBackupButton = ({ createBackup }) => {
  return (
    <Button
      variant="contained"
      id="upload"
      color="primary"
      className="backup-button"
      data-test="download-backup"
      onClick={() => {
        createBackup();
      }}
    >
      <Backup className="small-icon" />
      {strings.common.download}
    </Button>
  );
};

export default DownloadBackupButton;
