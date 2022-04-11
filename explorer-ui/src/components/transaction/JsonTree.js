import * as React from "react";
import Paper from "@mui/material/Paper";
import axios from "axios";
import config from "../../config";
import dynamic from "next/dynamic";
const DynamicJSONEditor = dynamic(() => import("./JSONEditor"), {
  // Disable server side rendering (ssr):
  ssr: false,
  loading: () => <p>...</p>,
});

export const JsonTree = (props) => {
  const [data, setData] = React.useState({});

  React.useEffect(() => {
    fetchBlockchain();
  }, []);

  async function fetchBlockchain() {
    let multichain = { name: "Multichain", children: [] };
    let streams = [];

    await axios
      .get(config.baseUrlToExplorerApi + "/streams")
      .then((response) => {
        // get all streams and sort them by length
        const streamsData = response?.data?.sort(
          (a, b) => a.name.length - b.name.length
        );
        streams = streamsData.map((s) => s.name);
      });

    for (let i = 0; i < streams.length; i++) {
      const currentStream = streams[i];
      await axios
        .get(
          config.baseUrlToExplorerApi +
            `/stream.getAllStreamItems?name=${currentStream}`
        )
        .then((response) => {
          if (response.status === 200) {
            console.log("Successfully fetched " + currentStream);

            multichain.children = [
              ...multichain.children,
              {
                name: currentStream,
                children: [...response.data],
              },
            ];
          } else {
            console.log("FAILED to fetch " + currentStream);
          }
        });
    }
    setData(multichain);
  }

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <DynamicJSONEditor json={data} />
    </Paper>
  );
};
