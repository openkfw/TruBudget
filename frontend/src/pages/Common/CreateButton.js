import React from "react";

import Add from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";

import "./CreateButton.scss";

const CreateButton = ({ dataTest = "create", color = "primary", onClick, buttonText }) => {
  return (
    <Fab data-test={dataTest} onClick={onClick} color={color} className="create-button" aria-label="Add">
      <span className="create-button-text">{buttonText}</span>
      <Add sx={{ width: "1.25rem", height: "1.25rem" }} />
    </Fab>
  );
};

export default CreateButton;
