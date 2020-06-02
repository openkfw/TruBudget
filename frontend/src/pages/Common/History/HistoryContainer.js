import { withStyles } from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
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
      <ExpansionPanel data-test="search-history">
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <SearchIcon />
          <Typography>{strings.common.search}</Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <HistorySearch fetchFirstHistoryEvents={fetchFirstHistoryEvents} users={users} eventTypes={eventTypes} />
        </ExpansionPanelDetails>
      </ExpansionPanel>
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
