import React from "react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";

import strings from "../../../localizeStrings";

import HistorySearch from "./HistorySearch";
import ScrollingHistory from "./ScrollingHistory";

const HistoryContainer = ({
  events,
  nEventsTotal,
  fetchNext,
  fetchFirstHistoryEvents,
  hasMore,
  isLoading,
  getUserDisplayname,
  users,
  eventTypes,
  historyType
}) => {
  return (
    <div>
      <Accordion data-test="search-history">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon />
          <Typography>{strings.common.search}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <HistorySearch fetchFirstHistoryEvents={fetchFirstHistoryEvents} users={users} eventTypes={eventTypes} />
        </AccordionDetails>
      </Accordion>
      <ScrollingHistory
        events={events}
        nEventsTotal={nEventsTotal}
        hasMore={hasMore}
        isLoading={isLoading}
        getUserDisplayname={getUserDisplayname}
        fetchNext={fetchNext}
        historyType={historyType}
      />
    </div>
  );
};

export default HistoryContainer;
