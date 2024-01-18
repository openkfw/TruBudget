import React from "react";

import ContentAdd from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/Reorder";
import { Tooltip } from "@mui/material";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";

import strings from "../../localizeStrings";

import SubProjectTable from "./SubProjectTable";

const SubProjects = (props) => {
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
        <Tooltip
          title={
            !props.canCreateSubProject
              ? strings.common.no_permissions
              : props.projectStatus === "closed"
              ? strings.eventTypes.project_closed
              : strings.subproject.subproject_add_title
          }
        >
          <span>
            <Fab
              aria-label="create subproject"
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
          </span>
        </Tooltip>
        <Tooltip title={strings.common.project_history}>
          <Fab
            aria-label="show project history"
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
        </Tooltip>
      </div>
    </div>
  );
};

export default SubProjects;
