import CircularProgress from "@material-ui/core/CircularProgress";
import React from "react";
import InfiniteScroll from "react-infinite-scroller";

import HistoryList from "./HistoryList";

const styles = {
  loader: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 400,
    display: "flex",
    justifyContent: "center",

    padding: "16px 0px"
  }
};

export default class ScrollingHistory extends React.Component {
  componentDidMount() {
    this.props.fetchNext();
  }

  render() {
    const { nEventsTotal, events, fetchNext, hasMore, isLoading, getUserDisplayname } = this.props;
    return (
      <InfiniteScroll
        pageStart={0}
        initialLoad={false}
        useWindow={false}
        loadMore={page => {
          if (!isLoading && hasMore) fetchNext();
        }}
        hasMore={hasMore}
        loader={
          <div className="loader" key={0} style={styles.loader}>
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
        />
      </InfiniteScroll>
    );
  }
}
