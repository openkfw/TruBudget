import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import axios from "axios";
import { SeverityPill } from "./SeverityPill";

const baseUrlToExplorerApi = "http://localhost:8081";

export const StreamSelect = () => {
  const [streams, setStreams] = React.useState([]);
  const [selected, setSelected] = React.useState("");

  React.useEffect(() => {
    fetchStreams();
  }, []);

  React.useEffect(() => {
    console.log(selected);
  }, [selected]);

  React.useEffect(() => {
    console.log(streams);
  }, [streams]);

  async function fetchStreams() {
    await axios.get(baseUrlToExplorerApi + "/streams").then((response) => {
      console.log(response);
      setStreams(response?.data?.sort((a, b) => a.length - b.length));
    });
  }

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <Button
        size="small"
        variant="outlined"
        sx={{ margin: "10px" }}
        onClick={fetchStreams}
      >
        Fetch Streams
      </Button>
      <Box sx={{ margin: "10px" }}>
        {streams?.map((s) => {
          return (
            <SeverityPill
              key={s.name}
              name={s.name}
              isSelected={selected === s.name}
              setSelected={setSelected}
              sx={{ margin: "5px" }}
            >
              {s.name}
            </SeverityPill>
          );
        })}
      </Box>
    </Paper>
  );
};
