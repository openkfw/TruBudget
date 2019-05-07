import React from "react";
import { connect } from "react-redux";
import HistoryDrawer from "../Common/History/HistoryDrawer";
import { hideHistory } from "../Notifications/actions";
import { fetchSubprojectHistory } from "../Workflows/actions";

function SubprojectHistoryDrawer({
  projectId,
  subprojectId,
  offset,
  limit,
  doShow,
  events,
  nEventsTotal,
  hasMore,
  isLoading,
  getUserDisplayname,
  hideHistory,
  fetchSubprojectHistory
}) {
  return (
    <HistoryDrawer
      doShow={doShow}
      onClose={hideHistory}
      events={events}
      nEventsTotal={nEventsTotal}
      fetchNext={() => fetchSubprojectHistory(projectId, subprojectId, offset, limit)}
      hasMore={hasMore}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
    />
  );
}

function mapStateToProps(state) {
  return {
    offset: state.getIn(["workflow", "offset"]),
    limit: state.getIn(["workflow", "limit"]),
    doShow: state.getIn(["workflow", "showHistory"]),
    events: state.getIn(["workflow", "historyItems"]),
    nEventsTotal: state.getIn(["workflow", "historyItemsCount"]),
    hasMore: state.getIn(["workflow", "hasMoreHistory"]),
    isLoading: state.getIn(["workflow", "isHistoryLoading"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid])
  };
}

const mapDispatchToProps = {
  hideHistory,
  fetchSubprojectHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(SubprojectHistoryDrawer);
