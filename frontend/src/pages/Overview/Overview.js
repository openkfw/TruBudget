import React, { useEffect } from "react";

import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

import { useTourAppContext } from "../../context/tour";
import strings from "../../localizeStrings";

import CardView from "./CardView";
import TableView from "./TableView";

import "./Overview.scss";

const Overview = (props) => {
  const { goToNextStepIf } = useTourAppContext();

  useEffect(() => {
    goToNextStepIf();
  });

  return (
    <Box>
      <Box className="overview-box">
        {props.projectView === "table" ? (
          <IconButton
            aria-label="view grid"
            onClick={() => props.setProjectView("card")}
            data-test="set-card-view"
            className="view-button"
            id="card-table-view-switch"
          >
            <GridViewIcon color="primary" />
          </IconButton>
        ) : (
          <Tooltip title={strings.common.switch_to_table}>
            <IconButton
              aria-label="view list"
              onClick={() => props.setProjectView("table")}
              data-test="set-table-view"
              className="view-button"
              id="card-table-view-switch"
            >
              <ViewListIcon color="primary" />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      {props.projectView === "card" && (
        <Box className="card-view-box">
          <CardView {...props} />
        </Box>
      )}
      {props.projectView === "table" && (
        <Box>
          <TableView {...props} />
        </Box>
      )}
    </Box>
  );
};

export default Overview;
