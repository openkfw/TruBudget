import React from "react";
import { CircularProgress } from "material-ui/Progress";

import { ACMECorpLightgreen } from "../../colors";

const styles = {
  container: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    position: "absolute",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "40vh",
    width: "100%",
    height: "100%",
    zIndex: 2000
  },
  refreshContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "top",
    justifyContent: "center"
  },
  refresh: {
    display: "inline-block",
    position: "relative"
  }
};

const Refresh = props => (
  <div style={styles.container}>
    <div style={styles.refreshContainer}>
      <CircularProgress size={50} left={0} top={0} percentage={50} color="primary" style={styles.refresh} />
    </div>
  </div>
);

// TODO: SET Correct Color material v1

export default Refresh;
