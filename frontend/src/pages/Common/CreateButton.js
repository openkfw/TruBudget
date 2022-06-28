import React from "react";
import Fab from "@mui/material/Fab";
import Add from "@mui/icons-material/Add";

const defaultStyles = {
  createButtonContainer: {
    height: 20
  },
  createButton: {
    position: "absolute"
  }
};

const CreateButton = ({ dataTest = "create", color = "primary", onClick, styles = defaultStyles }) => {
  return (
    <div style={{ ...defaultStyles.createButtonContainer, ...styles.createButtonContainer }}>
      <Fab
        data-test={dataTest}
        onClick={onClick}
        color={color}
        style={{ ...defaultStyles.createButton, ...styles.createButton }}
        aria-label="Add"
      >
        <Add />
      </Fab>
    </div>
  );
};

export default CreateButton;
