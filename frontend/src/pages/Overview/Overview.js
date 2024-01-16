import React from "react";

import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";

import { useTourAppContext } from "../../context/tour";

import CardView from "./CardView";
import TableView from "./TableView";

const styles = {
  button: {
    margin: "10px"
  }
};

const Overview = (props) => {
  const {
    setState,
    state: { run }
  } = useTourAppContext();

  const handleClickStart = () => {
    setState({ run: true, stepIndex: 0, tourActive: true });
  };

  return (
    <Box>
      <Box sx={{ display: "flex" }}>
        {props.projectView === "table" ? (
          <IconButton
            aria-label="view grid"
            onClick={() => props.setProjectView("card")}
            data-test="set-card-view"
            sx={styles.button}
          >
            <GridViewIcon color="primary" />
          </IconButton>
        ) : (
          <IconButton
            aria-label="view list"
            onClick={() => props.setProjectView("table")}
            data-test="set-table-view"
            sx={styles.button}
          >
            <ViewListIcon color="primary" />
          </IconButton>
        )}
        {!run && <button onClick={handleClickStart}>start tour</button>}
      </Box>
      {props.projectView === "card" && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
