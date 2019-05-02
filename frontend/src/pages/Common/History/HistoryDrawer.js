import Drawer from "@material-ui/core/Drawer";
import React from "react";

import ScrollingHistory from "./ScrollingHistory";

export default function HistoryDrawer({
  doShow,
  onClose,
  events,
  nEventsTotal,
  fetchNext,
  hasMore,
  isLoading,
  getUserDisplayname
}) {
  return (
    <Drawer open={doShow} onClose={onClose} anchor="right">
      <ScrollingHistory
        events={events}
        nEventsTotal={nEventsTotal}
        hasMore={hasMore}
        isLoading={isLoading}
        getUserDisplayname={getUserDisplayname}
        fetchNext={fetchNext}
      />
    </Drawer>
  );
}
