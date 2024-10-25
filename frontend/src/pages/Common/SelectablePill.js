import * as React from "react";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
export default function SelectablePill(props) {
  const { label = "empty", onClick, sx, isSelected = false, "data-test": dataTest } = props;
  const theme = useTheme();

  const backgroundColor = isSelected ? theme.palette.tag.selected : theme.palette.tag.main;

  return (
    <Chip
      label={label}
      color="primary"
      size="small"
      variant={isSelected ? "filled" : "outlined"}
      data-test={dataTest}
      className="selectable-pill"
      sx={{
        backgroundColor: backgroundColor,
        ":hover": {
          color: isSelected ? "white" : "black"
        },
        ...sx
      }}
      clickable={true}
      onClick={onClick}
      component="span"
    />
  );
}
