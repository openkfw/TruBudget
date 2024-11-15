import React from "react";

import Chip from "@mui/material/Chip";
import { styled } from "@mui/system";

const StatusCircle = styled("span")(({ theme, status }) => ({
  width: "0.75rem",
  height: "0.75rem",
  borderRadius: "50%",
  border: "2px solid white",
  backgroundColor: status === "open" ? theme.palette.openStatus : theme.palette.closeStatus,
  marginRight: "0.5rem"
}));

const StatusChip = ({ status }) => {
  return (
    <Chip
      sx={(theme) => ({
        color: theme.palette.darkGrey,
        background: theme.palette.primaryBlue,
        fontSize: "0.75rem",
        fontWeight: "400",
        lineHeight: "140%"
      })}
      icon={<StatusCircle status={status} />}
      label={status}
      component="span"
    />
  );
};

export default StatusChip;
