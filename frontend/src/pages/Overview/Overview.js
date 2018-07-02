import React from "react";

import OverviewTable from "./OverviewTable";

const Overview = props => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <OverviewTable {...props} />
    </div>
  );
};

export default Overview;
