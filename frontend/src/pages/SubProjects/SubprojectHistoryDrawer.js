import React from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import HistoryDrawer from "../Common/History/HistoryDrawer";
import { hideHistory } from "../Notifications/actions";
import { subprojectEventTypes } from "../Common/History/eventTypes";
import { fetchNextSubprojectHistoryPage, fetchFirstSubprojectHistoryPage } from "../Workflows/actions";

function SubprojectHistoryDrawer({
  projectId,
  subprojectId,
  doShow,
  events,
  nEventsTotal,
  isLoading,
  getUserDisplayname,
  hideHistory,
  currentHistoryPage,
  lastHistoryPage,
  fetchNextSubprojectHistoryPage,
  fetchFirstSubprojectHistoryPage,
  users
}) {
  return (
    <HistoryDrawer
      doShow={doShow}
      onClose={hideHistory}
      events={events}
      nEventsTotal={nEventsTotal}
      fetchNextHistoryEvents={filter => fetchNextSubprojectHistoryPage(projectId, subprojectId, filter)}
      fetchFirstHistoryEvents={filter => fetchFirstSubprojectHistoryPage(projectId, subprojectId, filter)}
      hasMore={currentHistoryPage < lastHistoryPage}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
      users={users}
      eventTypes={subprojectEventTypes()}
    />
  );
}

function mapStateToProps(state) {
  return {
    users: state.getIn(["login", "user"]),
    doShow: state.getIn(["workflow", "showHistory"]),
    events: state.getIn(["workflow", "historyItems"]),
    nEventsTotal: state.getIn(["workflow", "historyItemsCount"]),
    isLoading: state.getIn(["workflow", "isHistoryLoading"]),
    currentHistoryPage: state.getIn(["workflow", "currentHistoryPage"]),
    lastHistoryPage: state.getIn(["workflow", "lastHistoryPage"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid]) || "Somebody"
  };
}

function mapDispatchToProps(dispatch) {
  return {
    hideHistory: () => dispatch(hideHistory()),
    fetchNextSubprojectHistoryPage: (projectId, subprojectId, filter) =>
      dispatch(fetchNextSubprojectHistoryPage(projectId, subprojectId, filter)),
    fetchFirstSubprojectHistoryPage: (projectId, subprojectId, filter) =>
      dispatch(fetchFirstSubprojectHistoryPage(projectId, subprojectId, filter))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(toJS(SubprojectHistoryDrawer));
