import React from "react";

import OverviewTable from "./OverviewTable";
import ProjectDialog from "./ProjectDialog";

const Overview = props => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ProjectDialog {...props} />
      <OverviewTable {...props} />
    </div>
  );
};

export default Overview;
