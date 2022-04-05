import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { withStyles } from "@mui/styles";
import React from "react";

const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const InformationDialog = props => {
  const { dialogShown, title, content, handleClose, closeLabel, classes } = props;
  return (
    <>
      <Dialog classes={{ paper: classes.paperRoot }} open={dialogShown} data-test="information-dialog">
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
export default withStyles(styles)(InformationDialog);
