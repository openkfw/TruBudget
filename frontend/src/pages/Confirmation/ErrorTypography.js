import React from "react";

import WarningIcon from "@mui/icons-material/Warning";
import { Typography } from "@mui/material";

const styles = {
  warning: {
    backgroundColor: "rgb(255, 165, 0, 0.7)",
    color: "black",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: "orange",
    padding: "2px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  error: {
    backgroundColor: "rgb(255, 0, 0, 0.7)",
    color: "black",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: "red",
    padding: "2px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }
};

class ErrorTypography extends React.Component {
  render() {
    const { type, showWarningIcon } = this.props;
    const icon = showWarningIcon ? <WarningIcon titleAccess="Warning" style={{ marginLeft: "4px" }} /> : "";

    return (
      <Typography data-test={`confirmation-${type}`} style={styles[type]}>
        {this.props.text}
        {icon}
      </Typography>
    );
  }
}

export default ErrorTypography;
