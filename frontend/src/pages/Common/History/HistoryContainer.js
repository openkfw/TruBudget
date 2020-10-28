import { withStyles } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import strings from "../../../localizeStrings";
import HistorySearch from "./HistorySearch";
import ScrollingHistory from "./ScrollingHistory";

const styles = {};

const HistoryContainer = ({
  classes,
  events,
  nEventsTotal,
  fetchNext,
  fetchFirstHistoryEvents,
  hasMore,
  isLoading,
  getUserDisplayname,
  users,
  eventTypes
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
      />
    </div>
  );
};

export default withStyles(styles)(HistoryContainer);
