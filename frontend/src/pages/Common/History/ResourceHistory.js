import React from "react";
import moment from "moment";

import Card from "@material-ui/core/Card";
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Avatar from "@material-ui/core/Avatar";
import CircularProgress from "@material-ui/core/CircularProgress";

import InfiniteScroll from "react-infinite-scroller";

import strings from "../../../localizeStrings";

const styles = {
  empty: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  list: {
    maxWidth: "350px",
    minWidth: "350px"
  },
  icon: {
    fontSize: "40px"
  }
};

const loadFunc = ( fetchNextHistoryItems) => {
  fetchNextHistoryItems()

};

export default ({
  offset,
  limit,
  historyItemsCount,
  setProjectHistoryOffset,
  fetchNextHistoryItems,
  show,
  close,
  resourceHistory,
  mapIntent
}) => {
  let items = [];
  resourceHistory.map((i, index) =>
    items.push(
      <ListItem key={index}>
        <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
        <ListItemText
          primary={mapIntent(i)}
          secondary={i.createdAt ? moment(i.createdAt).fromNow() : "Processing ..."}
        />
      </ListItem>
    )
  );
  const hasMore = offset + limit >= historyItemsCount ? false : true;
  console.log(`hasMore: ${hasMore}, offset: ${offset}, limit: ${limit}, historyItemsCount: ${historyItemsCount}`);
  return (
    <Drawer open={show} onClose={close} anchor="right">
      {resourceHistory.length > 0 ? (
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          useWindow={false}
          loadMore={_ => loadFunc(fetchNextHistoryItems)}
          hasMore={hasMore}
          loader={
            <div className="loader" key={0}>
              TEST
            </div>
          }
        >
          <List subheader={<ListSubheader disableSticky>{strings.common.history}</ListSubheader>} style={styles.list}>
            {items}
          </List>
        </InfiniteScroll>
      ) : (
        <div style={{ ...styles.empty, ...styles.list }}>
          <Card elevation={0}>
            <div style={styles.container}>
              <div style={styles.refreshContainer}>
                <CircularProgress size={50} left={0} top={0} percentage={50} color="primary" style={styles.refresh} />
              </div>
            </div>
          </Card>
        </div>
      )}
    </Drawer>
  );
};
