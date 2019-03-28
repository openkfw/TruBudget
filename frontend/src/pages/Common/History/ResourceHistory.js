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
  },
  loader: {
    fontFamily: "Roboto",
    fontStyle: "normal",
    fontWeight: 400
    // src: local('Roboto'), local('Roboto-Regular'), url(/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2) format('woff2'),
    // unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215,
  }
};

const loadFunc = (isLoading, fetchNextHistoryItems) => {
  if (!isLoading) fetchNextHistoryItems();
};

function creationTimeExists(item) {
  if (item.createdAt) {
    return moment(item.createdAt).fromNow();
  }
  if (item.businessEvent.time) {
    return moment(item.businessEvent.time).fromNow();
  }
  return "Processing ...";
}

export default ({
  offset,
  limit,
  historyItemsCount,
  isLoading,
  fetchNextHistoryItems,
  show,
  close,
  resourceHistory,
  mapIntent,
  userDisplayNameMap
}) => {
  let items = [];
  resourceHistory.map((i, index) => {
    return items.push(
      <ListItem key={index}>
        <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
        <ListItemText
          primary={
            i.intent
              ? mapIntent(i)
              : mapIntent({
                  createdBy: userDisplayNameMap[i.businessEvent.publisher],
                  intent: i.businessEvent.type,
                  data: {
                    intent: i.businessEvent.permission || "",
                    identity: i.businessEvent.grantee || i.businessEvent.revokee || i.businessEvent.assignee || "",
                    update: i.businessEvent.update || {}
                  },
                  snapshot: i.snapshot
                })
          }
          secondary={creationTimeExists(i)}
        />
      </ListItem>
    );
  });
  // limit is set to 0 by saga when fetching the last items
  const hasMore = limit !== 0 ? true : false;
  if (!hasMore && !isLoading) {
    items.push(
      <ListItem key={historyItemsCount + 1}>
        <Avatar alt={""} src="" />
        <ListItemText primary="" secondary="Last Element reached" />
      </ListItem>
    );
  }
  return (
    <Drawer open={show} onClose={close} anchor="right">
      {resourceHistory.length > 0 ? (
        <InfiniteScroll
          pageStart={0}
          initialLoad={false}
          useWindow={false}
          loadMore={_ => loadFunc(isLoading, fetchNextHistoryItems)}
          hasMore={hasMore}
          loader={
            <div className="loader" key={0} style={styles.loader}>
              {strings.login.loading}
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
