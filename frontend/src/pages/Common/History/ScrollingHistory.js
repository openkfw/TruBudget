import React from "react";
import InfiniteScroll from "react-infinite-scroller";

import strings from "../../../localizeStrings";
import HistoryList from "../HistoryList";

const styles = {
  loader: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 400
  }
};

export default function ScrollingHistory({ nEventsTotal, events, fetchNext, hasMore, isLoading, getUserDisplayname }) {
  return (
    <InfiniteScroll
      pageStart={0}
      initialLoad={true}
      useWindow={false}
      loadMore={_ => {
        if (!isLoading && hasMore) fetchNext();
      }}
      hasMore={hasMore}
      loader={
        <div className="loader" key={0} style={styles.loader}>
          {strings.login.loading}
        </div>
      }
    >
      <HistoryList
        className="history-list"
        events={events}
        nEventsTotal={nEventsTotal}
        hasMore={hasMore}
        isLoading={isLoading}
        getUserDisplayname={getUserDisplayname}
      />
    </InfiniteScroll>
  );
}
