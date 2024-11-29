import React from "react";

import HistoryIcon from "@mui/icons-material/Reorder";
import { Tooltip } from "@mui/material";
import Card from "@mui/material/Card";
import Fab from "@mui/material/Fab";

import strings from "../../localizeStrings";

import SubProjectTable from "./SubProjectTable";

import "./SubProjects.scss";

const SubProjects = (props) => {
  return (
    <div data-test="sub-projects" className="sub-projects">
      <Card>{props.isDataLoading ? null : <SubProjectTable {...props} />}</Card>
      <div className="sub-projects-container">
        <Tooltip title={strings.common.project_history}>
          <Fab
            aria-label="show project history"
            data-test="project-history-button"
            size="small"
            onClick={props.openHistory}
            className="sub-projects-history"
          >
            <HistoryIcon />
          </Fab>
        </Tooltip>
      </div>
    </div>
  );
};

export default SubProjects;
