import React from "react";

import CircleIcon from "@mui/icons-material/Circle";
import { Chip } from "@mui/material";

import { statusMapping } from "../../helper";

import "./ChipStatus.scss";

export const ChipStatus = ({ status }) => {
  let iconColor;
  const statusText = statusMapping(status);
  let chipClass;
  switch (status) {
    case "open":
      iconColor = "#1744E5";
      break;
    case "ongoing":
      iconColor = "#1744E5";
      chipClass = "blinkChip";
      break;
    case "closed":
      iconColor = "#39F439";
      break;
    default:
      iconColor = "#cccccc";
  }
  return (
    <Chip icon={<CircleIcon style={{ color: iconColor, height: "18px" }} className={chipClass} />} label={statusText} />
  );
};
