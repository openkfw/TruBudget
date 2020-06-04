import React from "react";
import { connect } from "react-redux";
import { toJS } from "../../../helper";
import HistoryContainer from "../../Common/History/HistoryContainer";
import useHistoryState from "../../Common/History/historyHook";
import { fetchNextWorkflowitemHistoryPage, fetchFirstWorkflowitemHistoryPage } from "./actions";
import { workflowitemEventTypes } from "../../Common/History/eventTypes";

const WorkflowitemHistoryTab = ({
  users,
  nEventsTotal,
  events,
  fetchFirstWorkflowitemHistoryPage,
  fetchNextWorkflowitemHistoryPage,
  currentHistoryPage,
  lastHistoryPage,
  projectId,
  subprojectId,
  workflowitemId,
  isLoading,
  getUserDisplayname
}) => {
  const [{ startAt, endAt, publisher, eventType }] = useHistoryState();
  const fetchFirstHistoryEvents = filter =>
    fetchFirstWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId, filter);
  const fetchNext = () =>
    fetchNextWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId, {
      startAt,
      endAt,
      publisher,
      eventType
    });
  return (
    <HistoryContainer
      fetchFirstHistoryEvents={fetchFirstHistoryEvents}
      users={users}
      eventTypes={workflowitemEventTypes()}
      events={events}
      nEventsTotal={nEventsTotal}
      hasMore={currentHistoryPage < lastHistoryPage}
      isLoading={isLoading}
      getUserDisplayname={getUserDisplayname}
      fetchNext={fetchNext}
    />
  );
};

function mapStateToProps(state) {
  return {
    users: state.getIn(["login", "user"]),
    events: state.getIn(["workflowitemDetails", "historyItems"]),
    nEventsTotal: state.getIn(["workflowitemDetails", "totalHistoryItemCount"]),
    isLoading: state.getIn(["workflowitemDetails", "isHistoryLoading"]),
    currentHistoryPage: state.getIn(["workflowitemDetails", "currentHistoryPage"]),
    lastHistoryPage: state.getIn(["workflowitemDetails", "lastHistoryPage"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid]) || "Somebody"
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchNextWorkflowitemHistoryPage: (projectId, subprojectId, workflowitemId, filter) =>
      dispatch(fetchNextWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId, filter)),
    fetchFirstWorkflowitemHistoryPage: (projectId, subprojectId, workflowitemId, filter) =>
      dispatch(fetchFirstWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId, filter))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowitemHistoryTab));
