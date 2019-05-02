import React from "react";
import { connect } from "react-redux";

import ScrollingHistory from "../Common/History/ScrollingHistory";
import { fetchWorkflowitemHistory } from "../WorkflowitemDetails/actions";

function WorkflowitemHistoryTab({
  projectId,
  subprojectId,
  workflowitemId,
  offset,
  limit,
  events,
  nEventsTotal,
  hasMore,
  isLoading,
  getUserDisplayname,
  fetchWorkflowitemHistory
}) {
  return (
    <ScrollingHistory
      events={events}
      nEventsTotal={nEventsTotal}
      hasMore={hasMore}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
      fetchNext={() => fetchWorkflowitemHistory(projectId, subprojectId, workflowitemId, offset, limit)}
      initialLoad={true}
    />
  );
}

function mapStateToProps(state) {
  return {
    offset: state.getIn(["workflowitemDetails", "offset"]),
    limit: state.getIn(["workflowitemDetails", "limit"]),
    events: state.getIn(["workflowitemDetails", "events"]),
    nEventsTotal: state.getIn(["workflowitemDetails", "nEventsTotal"]),
    hasMore: state.getIn(["workflowitemDetails", "hasMore"]),
    isLoading: state.getIn(["workflowitemDetails", "isLoading"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid])
  };
}

const mapDispatchToProps = {
  fetchWorkflowitemHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(WorkflowitemHistoryTab);
