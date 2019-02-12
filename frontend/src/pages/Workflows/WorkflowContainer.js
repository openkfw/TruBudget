import React, { Component } from "react";
import { connect } from "react-redux";

import globalStyles from "../../styles";

import {
  fetchWorkflowItems,
  showCreateDialog,
  showWorkflowDetails,
  updateWorkflowSortOnState,
  enableWorkflowSort,
  storeWorkflowType,
  reorderWorkflowItems,
  enableSubProjectBudgetEdit,
  storeSubProjectAmount,
  postSubProjectEdit,
  isWorkflowApprovalRequired,
  fetchAllSubprojectDetails,
  showWorkflowItemPermissions,
  closeWorkflowItem,
  showSubProjectAssignee,
  fetchSubprojectHistory,
  showEditDialog,
  closeSubproject,
  hideWorkflowDetails,
  hideWorkflowDialog,
  saveWorkflowItemsBeforeSort,
  liveUpdateSubproject,
  storeWorkflowItemsSelected,
  storePermissions,
  showWorkflowItemPreview,
  closeDrawer,
  storeWorkflowItemsAssignee
} from "./actions";

import { addDocument } from "../Documents/actions";

import { setSelectedView } from "../Navbar/actions";
import { showHistory } from "../Notifications/actions";
import Workflow from "./Workflow";
import SubProjectDetails from "./SubProjectDetails";
import { canViewSubProjectPermissions, canAssignSubProject, canCloseSubProject } from "../../permissions";
import { toJS } from "../../helper";
import WorkflowItemPermissionsContainer from "./WorkflowItemPermissionsContainer";
import strings from "../../localizeStrings";
import SubProjectHistoryContainer from "./SubProjectHistoryContainer";
import { fetchUser } from "../Login/actions";
import WorkflowDialogContainer from "./WorkflowDialogContainer";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import WorkflowEditDrawer from "./WorkflowEditDrawer";

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
    this.props.disableWorkflowSort();
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
          <WorkflowEditDrawer {...this.props} />
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
    showWorkflowItemPermissions: wId => dispatch(showWorkflowItemPermissions(wId)),
    openHistory: (projectId, subprojectId, offset, limit) => {
      dispatch(fetchSubprojectHistory(projectId, subprojectId, offset, limit, true));
      dispatch(showHistory());
    },
    openWorkflowDetails: id => dispatch(showWorkflowDetails(id)),
    hideWorkflowDetails: () => dispatch(hideWorkflowDetails()),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true)),
    storeAssignee: assignee => dispatch(storeWorkflowItemsAssignee(assignee)),
    resetAssignee: () => dispatch(storeWorkflowItemsAssignee("")),
    fetchWorkflowItems: streamName => dispatch(fetchWorkflowItems(streamName)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),

    updateWorkflowSortOnState: items => dispatch(updateWorkflowSortOnState(items)),
    enableWorkflowSort: () => dispatch(enableWorkflowSort(true)),
    disableWorkflowSort: () => dispatch(enableWorkflowSort(false)),
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
    storeWorkflowItemsSelected: workflowItems => dispatch(storeWorkflowItemsSelected(workflowItems)),
    deselectWorkflowItems: () => dispatch(storeWorkflowItemsSelected([])),
    storePermissions: permissions => dispatch(storePermissions(permissions)),
    showWorkflowItemPreview: () => dispatch(showWorkflowItemPreview()),
    addDocument: (payload, name) => dispatch(addDocument(payload, name)),
    resetPermissions: () => dispatch(storePermissions({}))
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
    permissions: state.getIn(["workflow", "permissions"]),
    tempDrawerPermissions: state.getIn(["workflow", "tempDrawerPermissions"]),
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
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"]),
    workflowAssignee: state.getIn(["workflow", "workflowAssignee"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer));
