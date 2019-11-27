import { Typography } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React from "react";

const styles = {
  warning: {
    backgroundColor: "rgb(255, 165, 0, 0.7)",
    color: "black",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: "orange",
    padding: "2px",
    textAlign: "center"
  },
  error: {
    backgroundColor: "rgb(255, 0, 0, 0.7)",
    color: "black",
    borderStyle: "solid",
    borderRadius: "4px",
    borderColor: "red",
    padding: "2px",
    textAlign: "center"
  }
};

class ErrorTypography extends React.Component {
  render() {
    const { type } = this.props;
    return (
      <Typography data-test={`confirmation-${type}`} style={styles[type]}>
        {this.props.text}
      </Typography>
    );
  }
}

export default withStyles(styles)(ErrorTypography);
