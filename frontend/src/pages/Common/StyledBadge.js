import React from "react";
import Badge from "@mui/material/Badge";

const StyledBadge = props => {
  return (
    <Badge
      sx={{
        badge: {
          right: 14,
          top: 33,
          padding: "3px",
          background: theme => theme.palette.warning.main,
          border: theme => `2px solid ${theme.palette.background.paper}`
        }
      }}
      {...props}
    />
  );
};

export default StyledBadge;
