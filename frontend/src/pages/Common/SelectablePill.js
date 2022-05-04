import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";

const SelectionPillRoot = styled("span")(({ theme, sx }) => {
  const backgroundColor = theme.palette.tag.main;
  const color = "white";

  return {
    alignItems: "center",
    backgroundColor,
    borderRadius: 12,
    color,
    cursor: "default",
    display: "inline-flex",
    flexGrow: 0,
    flexShrink: 0,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(12),
    lineHeight: 2,
    fontWeight: 600,
    justifyContent: "center",
    letterSpacing: 0.5,
    minWidth: 20,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    whiteSpace: "nowrap",
    textTransform: "none",
    margin: "2px",
    ...sx
  };
});

export default function SelectablePill(props) {
  // eslint-disable-next-line no-useless-computed-key
  const { children, onClick, sx, isSelected = false, ["data-test"]: dataTest } = props;
  const theme = useTheme();

  const backgroundColor = isSelected ? theme.palette.tag.selected : theme.palette.tag.main;

  return (
    <SelectionPillRoot sx={{ ...sx, backgroundColor }}>
      <Box onClick={onClick} sx={{ cursor: "pointer" }} component="span" data-test={dataTest}>
        <span>{children}</span>
      </Box>
    </SelectionPillRoot>
  );
}
