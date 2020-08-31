import Card from "@material-ui/core/Card";
import Fab from "@material-ui/core/Fab";
import ContentAdd from "@material-ui/icons/Add";
import HistoryIcon from "@material-ui/icons/Reorder";
import React from "react";

import SubProjectTable from "./SubProjectTable";

const SubProjects = props => {
  return (
    <div
      data-test="sub-projects"
      style={{
        position: "relative",
        width: "100%",
        whiteSpace: "nowrap"
      }}
    >
      <Card>{props.isDataLoading ? null : <SubProjectTable {...props} />}</Card>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          position: "absolute",
          alignItems: "center",
          top: "16px",
          right: "-26px"
        }}
      >
        <Fab
          disabled={!props.canCreateSubProject || props.projectStatus === "closed"}
          onClick={props.showSubprojectDialog}
          color="primary"
          style={{
            position: "relative",
            zIndex: 20
          }}
          data-test="subproject-create-button"
        >
          <ContentAdd />
        </Fab>
        <Fab
          data-test="project-history-button"
          size="small"
          onClick={props.openHistory}
          style={{
            position: "relative",
            marginTop: "8px"
          }}
        >
          <HistoryIcon />
        </Fab>
      </div>
    </div>
  );
};

export default SubProjects;
