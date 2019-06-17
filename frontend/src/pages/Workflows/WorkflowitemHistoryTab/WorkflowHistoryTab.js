import React from "react";
import { connect } from "react-redux";

import { toJS } from "../../../helper";
import ScrollingHistory from "../../Common/History/ScrollingHistory";
import { fetchNextWorkflowitemHistoryPage, resetWorkflowitemHistory } from "./actions";

class WorkflowitemHistoryTab extends React.Component {
  componentWillUnmount() {
    this.props.resetWorkflowitemHistory();
  }

  render() {
    const {
      nEventsTotal,
      historyItems,
      fetchNextWorkflowitemHistoryPage,
      currentHistoryPage,
      lastHistoryPage,
      projectId,
      subprojectId,
      workflowitemId,
      isLoading,
      getUserDisplayname
    } = this.props;
    return (
      <ScrollingHistory
        events={historyItems}
        nEventsTotal={nEventsTotal}
        hasMore={currentHistoryPage < lastHistoryPage}
        isLoading={isLoading}
        getUserDisplayname={getUserDisplayname}
        fetchNext={() => fetchNextWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId)}
        initialLoad={true}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    historyItems: state.getIn(["workflowitemDetails", "historyItems"]),
    nEventsTotal: state.getIn(["workflowitemDetails", "totalHistoryItemCount"]),
    isLoading: state.getIn(["workflowitemDetails", "isHistoryLoading"]),
    currentHistoryPage: state.getIn(["workflowitemDetails", "currentHistoryPage"]),
    lastHistoryPage: state.getIn(["workflowitemDetails", "lastHistoryPage"]),
    getUserDisplayname: uid => state.getIn(["login", "userDisplayNameMap", uid]) || "Somebody"
  };
}

const mapDispatchToProps = {
  fetchNextWorkflowitemHistoryPage,
  resetWorkflowitemHistory
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowitemHistoryTab));
