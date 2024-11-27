import React from "react";

import Add from "@mui/icons-material/Add";
import { Typography } from "@mui/material";
import Fab from "@mui/material/Fab";

import "./CreateButton.scss";

const CreateButton = ({ dataTest = "create", color = "primary", onClick, buttonText }) => {
  return (
    <Fab data-test={dataTest} onClick={onClick} color={color} className="create-button" aria-label="Add">
      <Typography className="create-button-text">{buttonText}</Typography>
      <Add sx={{ width: "1.25rem", height: "1.25rem" }} />
    </Fab>
  );
};

export default CreateButton;
