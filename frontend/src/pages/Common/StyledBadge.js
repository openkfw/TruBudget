import { withStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";

const StyledBadge = withStyles(theme => ({
  badge: {
    right: 14,
    top: 33,
    padding: "3px",
    background: theme.palette.warning,
    border: `2px solid ${theme.palette.background.paper}`
  }
}))(Badge);

export default StyledBadge;
