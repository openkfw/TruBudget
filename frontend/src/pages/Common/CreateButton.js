import React from "react";

import Add from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";

import "./CreateButton.scss";

const CreateButton = ({ dataTest = "create", color = "primary", onClick }) => {
  return (
    <div className="create-button-container">
      <Fab data-test={dataTest} onClick={onClick} color={color} className="create-button" aria-label="Add">
        <Add />
      </Fab>
    </div>
  );
};

export default CreateButton;
