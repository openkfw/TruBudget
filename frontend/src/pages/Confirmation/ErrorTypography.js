import React from "react";

import WarningIcon from "@mui/icons-material/Warning";
import { Typography } from "@mui/material";

import "./ErrorTypography.scss";

class ErrorTypography extends React.Component {
  render() {
    const { type, showWarningIcon } = this.props;
    const icon = showWarningIcon ? <WarningIcon titleAccess="Warning" className="warning-icon" /> : "";

    return (
      <Typography
        data-test={`confirmation-${type}`}
        className={type === "warning" ? "error-typography-warning" : "error-typography-error"}
      >
        {this.props.text}
        {icon}
      </Typography>
    );
  }
}

export default ErrorTypography;
