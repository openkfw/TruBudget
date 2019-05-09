import React from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import ScrollingHistory from "../Common/History/ScrollingHistory";
import { fetchNextWorkflowitemHistoryPage } from "../WorkflowitemDetails/actions";

function WorkflowitemHistoryTab({
  projectId,
  subprojectId,
  workflowitemId,
  events,
  nEventsTotal,
  isLoading,
  getUserDisplayname,
  fetchNextWorkflowitemHistoryPage,
  currentHistoryPage,
  lastHistoryPage
}) {
  return (
    <ScrollingHistory
      events={events}
      nEventsTotal={nEventsTotal}
      hasMore={currentHistoryPage < lastHistoryPage}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
      fetchNext={() => fetchNextWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId)}
      initialLoad={true}
    />
  );
}

function mapStateToProps(state) {
  return {
    events: state.getIn(["workflowitemDetails", "events"]),
    nEventsTotal: state.getIn(["workflowitemDetails", "totalHistoryItemCount"]),
    isLoading: state.getIn(["workflowitemDetails", "isHistoryLoading"]),
    currentHistoryPage: state.getIn(["workflowitemDetails", "currentHistoryPage"]),
    lastHistoryPage: state.getIn(["workflowitemDetails", "lastHistoryPage"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid]) || "Somebody"
  };
}

const mapDispatchToProps = {
  fetchNextWorkflowitemHistoryPage
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowitemHistoryTab));
