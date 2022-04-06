import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

const SeverityPillRoot = styled("span")(
  ({ theme, ownerState, isSelected = false, sx }) => {
    const backgroundColor = isSelected
      ? theme.palette.primary.main
      : theme.palette.neutral[400];
    const color = theme.palette[ownerState.color].contrastText;

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
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      ...sx,
    };
  }
);

export const SeverityPill = (props) => {
  const {
    color = "primary",
    children,
    isSelected = false,
    name,
    setSelected,
    ...other
  } = props;

  const ownerState = { color };

  return (
    <SeverityPillRoot
      ownerState={ownerState}
      isSelected={isSelected}
      {...other}
    >
      <Box onClick={() => setSelected(name)} sx={{ cursor: "pointer" }}>
        {children}
      </Box>
    </SeverityPillRoot>
  );
};
