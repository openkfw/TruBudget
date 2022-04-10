import * as React from "react";
import Paper from "@mui/material/Paper";

import axios from "axios";
import config from "../../config";

export const DataTree = (props) => {
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    fetchBlockchain();
  }, []);

  async function fetchBlockchain() {
    let multichain = {};
    let streams = [];

    await axios
      .get(config.baseUrlToExplorerApi + "/streams")
      .then((response) => {
        console.log(response);
        // get all streams and sort them by length
        const streamsData = response?.data?.sort(
          (a, b) => a.name.length - b.name.length
        );
        streams = streamsData.map((s) => s.name);
      });

    console.log(" STREAM NAMES: ");
    console.log(streams);
    for (let i = 0; i < streams.length; i++) {
      const currentStream = streams[i];
      await axios
        .get(
          config.baseUrlToExplorerApi +
            `/stream.getAllStreamItems?name=${currentStream}`
        )
        .then((response) => {
          if (response.status === 200) {
            console.log("Successfully to fetch " + currentStream);
            multichain[currentStream] = response.data;
          } else {
            console.log("FAILED to fetch " + currentStream);
          }
        });
    }
    console.log("THE MUTLICHAIN: ");
    console.log({ multichain });
  }

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}></Paper>
  );
};
