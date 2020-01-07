import React from "react";

import CircularProgress from "@material-ui/core/CircularProgress";

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    position: "fixed",
    left: 0,
    alignItems: "center",
    justifyContent: "flex-start",
    top: "40%",
    width: "100%",
    height: "100%",
    zIndex: 2000
  },
  refreshContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "top",
    justifyContent: "center",
    marginRight: "50px"
  },
  refresh: {
    display: "inline-block",
    position: "relative"
  }
};

const Refresh = props => (
  <div style={styles.container}>
    <div style={styles.refreshContainer}>
      <CircularProgress
        data-test="loading-indicator"
        size={50}
        left={0}
        top={0}
        percentage={50}
        color="primary"
        style={styles.refresh}
      />
    </div>
  </div>
);

export default Refresh;
