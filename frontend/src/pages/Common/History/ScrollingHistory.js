import React from "react";
import InfiniteScroll from "react-infinite-scroller";

import CircularProgress from "@mui/material/CircularProgress";

import HistoryList from "./HistoryList";

export default class ScrollingHistory extends React.Component {
  componentDidMount() {
    this.props.fetchNext();
  }

  render() {
    const { nEventsTotal, events, fetchNext, hasMore, isLoading, getUserDisplayname, historyType } = this.props;
    return (
      <InfiniteScroll
        pageStart={0}
        initialLoad={false}
        useWindow={false}
        loadMore={() => {
          if (!isLoading && hasMore) fetchNext();
        }}
        hasMore={hasMore}
        loader={
          <div key={0} className="loader">
            {<CircularProgress />}
          </div>
        }
      >
        <HistoryList
          className="history-list"
          events={events}
          nEventsTotal={nEventsTotal}
          hasMore={hasMore}
          getUserDisplayname={getUserDisplayname}
          isLoading={isLoading}
          historyType={historyType}
        />
      </InfiniteScroll>
    );
  }
}
