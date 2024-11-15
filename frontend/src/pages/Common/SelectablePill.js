import * as React from "react";

import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
export default function SelectablePill(props) {
  const { label = "empty", onClick, sx, isSelected, "data-test": dataTest } = props;
  const theme = useTheme();
  const backgroundColor = isSelected ? theme.palette.tag.text : theme.palette.tag.main;
  const color = isSelected ? "white" : theme.palette.tag.text;

  return (
    <Chip
      label={label}
      size="small"
      data-test={dataTest}
      sx={(theme) => ({
        cursor: "pointer",
        margin: "0.125rem",
        fontSize: "1rem",
        display: "inline-flex",
        flexGrow: 0,
        flexShrink: 0,
        borderRadius: "12px",
        border: "none",
        backgroundColor: backgroundColor,
        color: color,
        "&:hover": {
          color: "white",
          backgroundColor: theme.palette.tag.text
        },
        "&.Mui-selected": {
          color: "white",
          backgroundColor: theme.palette.tag.text
        },
        ...sx
      })}
      clickable={true}
      onClick={onClick}
      component="span"
    />
  );
}
