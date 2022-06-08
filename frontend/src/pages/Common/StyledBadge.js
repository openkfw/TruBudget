import { withStyles } from "@mui/styles";
import Badge from "@mui/material/Badge";

const StyledBadge = withStyles(theme => ({
  badge: {
    right: 14,
    top: 33,
    padding: "3px",
    background: theme.palette.warning.main,
    border: `2px solid ${theme.palette.background.paper}`
  }
}))(Badge);

export default StyledBadge;
