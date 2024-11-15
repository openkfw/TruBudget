import React from "react";

import Box from "@mui/material/Box";

import TableView from "./TableView";

import "./Overview.scss";

const Overview = (props) => {
  return (
    <Box>
      <TableView {...props} />
    </Box>
  );
};

export default Overview;
