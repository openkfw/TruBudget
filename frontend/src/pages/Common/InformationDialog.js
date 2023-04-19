import React from "react";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const InformationDialog = (props) => {
  const { dialogShown, title, content, handleClose, closeLabel } = props;
  return (
    <>
      <Dialog style={{ paper: styles.paperRoot }} open={dialogShown} data-test="information-dialog">
        <DialogTitle> {title}</DialogTitle>
        <DialogContent data-test="infromation-dialog-content">{content ? content : ""}</DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" data-test="infromation-dialog-close">
            {closeLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default InformationDialog;
