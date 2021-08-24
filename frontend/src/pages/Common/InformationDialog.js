import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";
import React from "react";


const styles = {
  paperRoot: {
    width: "100%",
    overflow: "visible"
  }
};

const InformationDialog = (props) => {
  const { dialogShown, title, content, handleClose, closeLabel, classes } = props;
  return(
    <>
    <Dialog classes={{ paper: classes.paperRoot }} open={dialogShown} data-test="information-dialog">
        <DialogTitle> {title}</DialogTitle>
        <DialogContent data-test="infromation-dialog-content">
          {content ? content : ''}
        </DialogContent>
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

