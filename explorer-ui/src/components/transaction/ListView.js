import * as React from "react";
import Paper from "@mui/material/Paper";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { JsonView } from "./JsonView";
import axios from "axios";
import dayjs from "dayjs";
import Typography from "@mui/material/Typography";
import { Divider } from "@mui/material";
import config from "../../config";

const convertUnixEpochToDate = (epoch) => {
  return dayjs.unix(epoch).format("DD.MM.YYYY HH:mm:ss");
};

export const ListView = (props) => {
  const { selectedStream = "" } = props;

  const [streamItems, setStreamItems] = React.useState([]);

  React.useEffect(() => {
    setStreamItems([]);
    fetchStreamItems();
  }, [selectedStream]);

  React.useEffect(() => {
    console.log(streamItems);
  }, [streamItems]);

  async function fetchStreamItems() {
    if (selectedStream === "") {
      return;
    }
    await axios
      .get(
        config.baseUrlToExplorerApi +
          `/stream.getAllStreamItems?name=${selectedStream}`
      )
      .then((response) => {
        if (response.status === 200) {
          console.log(response.data);
          setStreamItems(response.data);
        }
      });
  }

  return (
    <Paper sx={{ width: "100%", height: "100%", overflow: "auto" }}>
      <Typography variant="h6" sx={{ margin: "20px" }}>
        Transactions of stream {selectedStream}
      </Typography>
      <Divider />
      {streamItems?.map((item, index) => {
        return (
          <Accordion id={item.txid}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="item-header"
            >
              <Typography>Transaction number {index + 1}: </Typography>
              <Typography sx={{ mx: "20px" }}>{item.txid}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{convertUnixEpochToDate(item.time)}</Typography>
              <br />
              <JsonView data={item.data}></JsonView>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
};
