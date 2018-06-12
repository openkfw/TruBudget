import React from "react";

import OverviewTable from "./OverviewTable";
import ProjectCreation from "./ProjectCreation";
import ProjectEdit from "./ProjectEdit";

const Overview = props => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <ProjectCreation {...props} />
      <ProjectEdit {...props} />
      <OverviewTable {...props} />
    </div>
  );
};

export default Overview;
