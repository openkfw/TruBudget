import React from "react";
import { connect } from "react-redux";
import HistoryDrawer from "../Common/History/HistoryDrawer";
import { hideHistory } from "../Notifications/actions";
import { fetchProjectHistory } from "./actions";

function ProjectHistoryDrawer({
  projectId,
  offset,
  limit,
  doShow,
  events,
  nEventsTotal,
  hasMore,
  isLoading,
  getUserDisplayname,
  hideHistory,
  fetchProjectHistory
}) {
  return (
    <HistoryDrawer
      doShow={doShow}
      onClose={hideHistory}
      events={events}
      nEventsTotal={nEventsTotal}
      fetchNext={() => fetchProjectHistory(projectId, offset, limit)}
      hasMore={hasMore}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
    />
  );
}

function mapStateToProps(state) {
  return {
    offset: state.getIn(["detailview", "offset"]),
    limit: state.getIn(["detailview", "limit"]),
    doShow: state.getIn(["detailview", "showHistory"]),
    events: state.getIn(["detailview", "historyItems"]),
    nEventsTotal: state.getIn(["detailview", "historyItemsCount"]),
    hasMore: state.getIn(["detailview", "hasMoreHistory"]),
    isLoading: state.getIn(["detailview", "isHistoryLoading"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid])
  };
}

const mapDispatchToProps = {
  hideHistory,
  fetchProjectHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(ProjectHistoryDrawer);
