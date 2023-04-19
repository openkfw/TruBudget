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
      sx={{
        cursor: "pointer",
        margin: "2px",
        fontSize: theme.typography.pxToRem(16),
        display: "inline-flex",
        flexGrow: 0,
        flexShrink: 0,
        borderRadius: 12,
        backgroundColor: backgroundColor,
        color: "white",
        ":hover": {
          color: isSelected ? "white" : "black"
        },
        ...sx
      }}
      clickable={true}
      onClick={onClick}
    />
  );
}
