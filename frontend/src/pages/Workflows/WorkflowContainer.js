import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import strings from "../../localizeStrings";
import { canAssignSubProject, canCloseSubProject, canViewSubProjectPermissions } from "../../permissions";
import globalStyles from "../../styles";
import { addDocument } from "../Documents/actions";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import { fetchUser } from "../Login/actions";
import { setSelectedView } from "../Navbar/actions";
import { showHistory } from "../Notifications/actions";
import {
  closeSubproject,
  closeWorkflowItem,
  enableSubProjectBudgetEdit,
  fetchAllSubprojectDetails,
  fetchSubprojectHistory,
  fetchWorkflowItems,
  hideWorkflowDetails,
  hideWorkflowDialog,
  isWorkflowApprovalRequired,
  liveUpdateSubproject,
  postSubProjectEdit,
  reorderWorkflowItems,
  saveWorkflowItemsBeforeSort,
  showCreateDialog,
  showEditDialog,
  showSubProjectAssignee,
  showWorkflowDetails,
  storeSubProjectAmount,
  storeWorkflowItemsSelected,
  storeWorkflowType,
  updateWorkflowOrderOnState,
  enableWorkflowEdit,
  disableWorkflowEdit
} from "./actions";
import SubProjectDetails from "./SubProjectDetails";
import SubProjectHistoryContainer from "./SubProjectHistoryContainer";
import Workflow from "./Workflow";
import WorkflowBatchEditContainer from "./WorkflowBatchEditContainer";
import WorkflowDialogContainer from "./WorkflowDialogContainer";
import WorkflowItemPermissionsContainer from "./WorkflowItemPermissionsContainer";

class WorkflowContainer extends Component {
  constructor(props) {
    super(props);
    const path = props.location.pathname.split("/");
    this.projectId = path[2];
    this.subProjectId = path[3];
  }

  componentWillMount() {
    this.props.setSelectedView(this.subProjectId, "subProject");
    this.props.fetchAllSubprojectDetails(this.projectId, this.subProjectId, true);
    this.props.fetchUser();
  }

  componentWillUnmount() {
    this.props.hideWorkflowDetails();
    this.props.hideWorkflowDialog();
    this.props.disableWorkflowEdit();
    this.props.resetPermissions();
    this.props.deselectWorkflowItems();
    this.props.resetAssignee();
  }

  closeSubproject = () => {
    const openWorkflowItems = this.props.workflowItems.find(wItem => wItem.data.status === "open");
    if (!openWorkflowItems) {
      this.props.closeSubproject(this.projectId, this.subProjectId);
    }
  };

  closeWorkflowItem = wId => this.props.closeWorkflowItem(this.projectId, this.subProjectId, wId);

  closeSubproject = () => this.props.closeSubproject(this.projectId, this.subProjectId, true);

  update = () => {
    this.props.updateSubProject(this.projectId, this.subProjectId);
  };

  addLiveUpdates = () => {
    return <LiveUpdates update={this.update} />;
  };

  render() {
    const canAssignSubproject = canAssignSubProject(this.props.allowedIntents);
    const canCloseSubproject = canCloseSubProject(this.props.allowedIntents);
    const canViewPermissions = canViewSubProjectPermissions(this.props.allowedIntents);
    return (
      <div>
        {!this.props.workflowSortEnabled ? this.addLiveUpdates() : null}
        <div style={globalStyles.innerContainer}>
          <SubProjectDetails
            {...this.props}
            canViewPermissions={canViewPermissions}
            canAssignSubproject={canAssignSubproject}
            closeSubproject={this.closeSubproject}
            canCloseSubproject={canCloseSubproject}
          />

          <WorkflowItemPermissionsContainer
            projectId={this.projectId}
            subProjectId={this.subProjectId}
            title={strings.workflow.workflow_permissions_title}
          />
          <Workflow
            {...this.props}
            projectId={this.projectId}
            subProjectId={this.subProjectId}
            closeWorkflowItem={this.closeWorkflowItem}
          />
          <WorkflowDialogContainer location={this.props.location} />
          <SubProjectHistoryContainer
            projectId={this.projectId}
            subprojectId={this.subProjectId}
            offset={this.props.offset}
            limit={this.props.limit}
          />
          <WorkflowBatchEditContainer projectId={this.projectId} subprojectId={this.subprojectId} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllSubprojectDetails: (pId, sId, loading) => dispatch(fetchAllSubprojectDetails(pId, sId, loading)),
    showCreateDialog: () => dispatch(showCreateDialog()),
    updateSubProject: (pId, sId) => dispatch(liveUpdateSubproject(pId, sId)),
    showSubProjectAssignee: () => dispatch(showSubProjectAssignee()),
    openHistory: (projectId, subprojectId, offset, limit) => {
      dispatch(fetchSubprojectHistory(projectId, subprojectId, offset, limit, true));
      dispatch(showHistory());
    },
    openWorkflowDetails: id => dispatch(showWorkflowDetails(id)),
    hideWorkflowDetails: () => dispatch(hideWorkflowDetails()),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true)),

    fetchWorkflowItems: streamName => dispatch(fetchWorkflowItems(streamName)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),

    updateWorkflowOrderOnState: items => dispatch(updateWorkflowOrderOnState(items)),
    enableWorkflowEdit: () => dispatch(enableWorkflowEdit()),
    disableWorkflowEdit: () => dispatch(disableWorkflowEdit()),
    reorderWorkflowItems: (projectId, subProjectId, workflowItems) =>
      dispatch(reorderWorkflowItems(projectId, subProjectId, workflowItems)),
    storeWorkflowType: value => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    storeSubProjectAmount: amount => dispatch(storeSubProjectAmount(amount)),
    postSubProjectEdit: (parent, streamName, status, amount) =>
      dispatch(postSubProjectEdit(parent, streamName, status, amount)),
    fetchUser: () => dispatch(fetchUser(true)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog()),
    isWorkflowApprovalRequired: approvalRequired => dispatch(isWorkflowApprovalRequired(approvalRequired)),
    showEditDialog: (id, displayName, amount, amountType, description, currency, documents) =>
      dispatch(showEditDialog(id, displayName, amount, amountType, description, currency, documents)),
    saveWorkflowItemsBeforeSort: workflowItems => dispatch(saveWorkflowItemsBeforeSort(workflowItems)),
    addDocument: (payload, name) => dispatch(addDocument(payload, name)),
    storeWorkflowItemsSelected: workflowItems => dispatch(storeWorkflowItemsSelected(workflowItems))
  };
};

const mapStateToProps = state => {
  return {
    id: state.getIn(["workflow", "id"]),
    displayName: state.getIn(["workflow", "displayName"]),
    description: state.getIn(["workflow", "description"]),
    status: state.getIn(["workflow", "status"]),
    amount: state.getIn(["workflow", "amount"]),
    currency: state.getIn(["workflow", "currency"]),
    assignee: state.getIn(["workflow", "assignee"]),
    created: state.getIn(["workflow", "created"]),
    allowedIntents: state.getIn(["workflow", "allowedIntents"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowItemsBeforeSort: state.getIn(["workflow", "workflowItemsBeforeSort"]),
    parentProject: state.getIn(["workflow", "parentProject"]),
    subProjectDetails: state.getIn(["workflow", "subProjectDetails"]),
    showWorkflowDetails: state.getIn(["workflow", "showDetails"]),
    showDetailsItemId: state.getIn(["workflow", "showDetailsItemId"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"]),
    budgetEditEnabled: state.getIn(["workflow", "subProjectBudgetEditEnabled"]),
    subProjectAmount: state.getIn(["workflow", "subProjectAmount"]),
    workflowDocuments: state.getIn(["documents", "tempDocuments"]),
    validatedDocuments: state.getIn(["documents", "validatedDocuments"]),
    users: state.getIn(["login", "user"]),
    offset: state.getIn(["workflow", "offset"]),
    limit: state.getIn(["workflow", "limit"]),
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer));
