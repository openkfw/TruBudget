import Fab from "@material-ui/core/Fab";
import Add from "@material-ui/icons/Add";
import React from "react";
import { withStyles } from "@material-ui/core/styles";

const styles = {
  createButtonContainer: {
    height: 20
  },
  createButton: {
    position: "absolute"
  }
};

const CreateButton = ({ classes, dataTest = "create", color = "primary", onClick }) => {
  return (
    <div className={classes.createButtonContainer}>
      <Fab data-test={dataTest} onClick={onClick} color={color} className={classes.createButton} aria-label="Add">
        <Add />
      </Fab>
    </div>
  );
};

export default withStyles(styles)(CreateButton);
