import Fab from "@mui/material/Fab";
import Add from "@mui/icons-material/Add";
import React from "react";
import { withStyles } from "@mui/styles";

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
