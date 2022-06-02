import React from "react";
import Box from "@mui/material/Box";
import GridViewIcon from "@mui/icons-material/GridView";
import IconButton from "@mui/material/IconButton";
import ViewListIcon from "@mui/icons-material/ViewList";
import CardView from "./CardView";
import TableView from "./TableView";

const styles = {
  button: {
    margin: "10px"
  }
};

const Overview = props => {
  return (
    <Box>
      <Box sx={{ display: "flex" }}>
        <IconButton onClick={() => props.setProjectView("card")} data-test="set-card-view" sx={styles.button}>
          <GridViewIcon color="primary" />
        </IconButton>
        <IconButton onClick={() => props.setProjectView("table")} data-test="set-table-view" sx={styles.button}>
          <ViewListIcon color="primary" />
        </IconButton>
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
