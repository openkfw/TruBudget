import React from "react";

import CircularProgress from "@mui/material/CircularProgress";

import "./RefreshIndicator.scss";

const Refresh = () => (
  <div className="refresh-indicator-container">
    <div className="refresh-indicators">
      <CircularProgress
        data-test="loading-indicator"
        size={50}
        left={0}
        top={0}
        percentage={50}
        color="primary"
        className="circular-progress"
      />
    </div>
  </div>
);

export default Refresh;
