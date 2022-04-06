import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import axios from "axios";
import { SeverityPill } from "./SeverityPill";

const baseUrlToExplorerApi = "http://localhost:8081";

export const StreamSelect = () => {
  const [streams, setStreams] = React.useState([]);

  React.useEffect(() => {
    fetchStreams();
  }, []);

  React.useEffect(() => {
    console.log(streams);
  }, [streams]);

  async function fetchStreams() {
    await axios.get(baseUrlToExplorerApi + "/streams").then((response) => {
      console.log(response);
      setStreams(response?.data);
    });
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Button
        size="small"
        variant="outlined"
        sx={{ m: "10px" }}
        onClick={fetchStreams}
      >
        Fetch Streams
      </Button>
      <Box sx={{ m: "10px" }}>
        {streams?.map((s) => {
          return (
            <SeverityPill key={s.name} sx={{ m: "5px" }}>
              {s.name}
            </SeverityPill>
          );
        })}
      </Box>
    </Paper>
  );
};
