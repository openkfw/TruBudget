import { withStyles } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import HistoryContainer from "./HistoryContainer";
import React from "react";
import useHistoryState from "./historyHook";

const styles = {};

const HistoryDrawer = ({
  classes,
  doShow,
  onClose,
  events,
  nEventsTotal,
  fetchNextHistoryEvents,
  fetchFirstHistoryEvents,
  hasMore,
  isLoading,
  getUserDisplayname,
  users,
  eventTypes
}) => {
  const [{ startAt, endAt, publisher, eventType }] = useHistoryState();
  const fetchNext = () => fetchNextHistoryEvents({ startAt, endAt, publisher, eventType });
  return (
    <Drawer open={doShow} onClose={onClose} anchor="right">
      <HistoryContainer
        fetchFirstHistoryEvents={fetchFirstHistoryEvents}
        users={users}
        eventTypes={eventTypes}
        events={events}
        nEventsTotal={nEventsTotal}
        hasMore={hasMore}
        isLoading={isLoading}
        getUserDisplayname={getUserDisplayname}
        fetchNext={fetchNext}
      />
    </Drawer>
  );
};

export default withStyles(styles)(HistoryDrawer);
