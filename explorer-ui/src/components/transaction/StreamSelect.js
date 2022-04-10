import * as React from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Divider } from "@mui/material";
import axios from "axios";
import { SeverityPill } from "./SeverityPill";
import config from "../../config";

export const StreamSelect = (props) => {
  const [streams, setStreams] = React.useState([]);
  const { selectedStream, setSelectedStream } = props;

  React.useEffect(() => {
    fetchStreams();
  }, []);

  React.useEffect(() => {
    console.log(selectedStream);
  }, [selectedStream]);

  React.useEffect(() => {
    console.log(streams);
  }, [streams]);

  async function fetchStreams() {
    await axios
      .get(config.baseUrlToExplorerApi + "/streams")
      .then((response) => {
        console.log(response);
        setStreams(
          response?.data?.sort((a, b) => a.name.length - b.name.length)
        );
      });
  }

  return (
    <Paper sx={{ width: "100%", overflow: "auto" }}>
      <Typography variant="h6" sx={{ margin: "20px" }}>
        Stream List
      </Typography>
      <Typography variant="body2" sx={{ margin: "20px" }}>
        Select a stream to view its transactions
      </Typography>
      <Divider />
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
              isSelected={selectedStream === s.name}
              setSelected={setSelectedStream}
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
