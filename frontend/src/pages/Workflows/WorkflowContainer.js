import React, { Component } from "react";
import { connect } from "react-redux";

import globalStyles from "../../styles";

import {
  fetchWorkflowItems,
  setCurrentStep,
  showCreateDialog,
  storeWorkflowComment,
  storeWorkflowCurrency,
  storeWorkflowAmount,
  storeWorkflowAmountType,
  storeWorkflowName,
  createWorkflowItem,
  editWorkflowItem,
  showWorkflowDetails,
  updateWorkflowSortOnState,
  enableWorkflowSort,
  storeWorkflowType,
  postWorkflowSort,
  enableSubProjectBudgetEdit,
  storeSubProjectAmount,
  postSubProjectEdit,
  isWorkflowApprovalRequired,
  fetchAllSubprojectDetails,
  storeWorkflowStatus,
  showWorkflowItemPermissions,
  closeWorkflowItem,
  showWorkflowItemAssignee,
  showSubProjectAssignee,
  fetchSubprojectHistory,
  showEditDialog,
  closeSubproject,
  hideWorkflowDialog,
  hideWorkflowDetails
} from "./actions";

import { setSelectedView } from "../Navbar/actions";
import { showHistory } from "../Notifications/actions";
import { addDocument, clearDocuments, prefillDocuments, validateDocument } from "../Documents/actions";
import Workflow from "./Workflow";
import SubProjectDetails from "./SubProjectDetails";
import { canViewSubProjectPermissions, canAssignSubProject, canCloseSubProject } from "../../permissions";
import { toJS } from "../../helper";
import WorkflowItemPermissionsContainer from "./WorkflowItemPermissionsContainer";
import strings from "../../localizeStrings";
import SubProjectHistoryContainer from "./SubProjectHistoryContainer";
import { fetchUser } from "../Login/actions";
import WorkflowDialogContainer from "./WorkflowDialogContainer";

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
  }

  closeSubproject = () => {
    const openWorkflowItems = this.props.workflowItems.find(wItem => wItem.data.status === "open");
    if (!openWorkflowItems) {
      this.props.closeSubproject(this.projectId, this.subProjectId);
    }
  };

  closeWorkflowItem = wId => this.props.closeWorkflowItem(this.projectId, this.subProjectId, wId);

  closeSubproject = () => this.props.closeSubproject(this.projectId, this.subProjectId, true);

  render() {
    const canAssignSubproject = canAssignSubProject(this.props.allowedIntents);
    const canCloseSubproject = canCloseSubProject(this.props.allowedIntents);
    const canViewPermissions = canViewSubProjectPermissions(this.props.allowedIntents);
    return (
      <div>
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
          <SubProjectHistoryContainer />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetchAllSubprojectDetails: (pId, sId, loading) => dispatch(fetchAllSubprojectDetails(pId, sId, loading)),
    showCreateDialog: () => dispatch(showCreateDialog()),

    showSubProjectAssignee: () => dispatch(showSubProjectAssignee()),
    showWorkflowItemPermissions: wId => dispatch(showWorkflowItemPermissions(wId)),
    openHistory: (projectId, subprojectId) => {
      dispatch(fetchSubprojectHistory(projectId, subprojectId, true));
      dispatch(showHistory());
    },
    openWorkflowDetails: id => dispatch(showWorkflowDetails(id)),
    hideWorkflowDetails: () => dispatch(hideWorkflowDetails()),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true)),
    showWorkflowItemAssignee: (workflowId, assignee) => dispatch(showWorkflowItemAssignee(workflowId, assignee)),
    fetchWorkflowItems: streamName => dispatch(fetchWorkflowItems(streamName)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),

    updateWorkflowSortOnState: items => dispatch(updateWorkflowSortOnState(items)),
    enableWorkflowSort: () => dispatch(enableWorkflowSort(true)),
    postWorkflowSort: (streamName, workflowItems) => dispatch(postWorkflowSort(streamName, workflowItems)),
    storeWorkflowType: value => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    storeSubProjectAmount: amount => dispatch(storeSubProjectAmount(amount)),
    postSubProjectEdit: (parent, streamName, status, amount) =>
      dispatch(postSubProjectEdit(parent, streamName, status, amount)),
    addDocument: (payload, name, id) => dispatch(addDocument(payload, name, id)),
    clearDocuments: () => dispatch(clearDocuments()),
    validateDocument: (payload, hash) => dispatch(validateDocument(payload, hash)),
    prefillDocuments: documents => dispatch(prefillDocuments(documents)),
    fetchUser: () => dispatch(fetchUser(true)),
    isWorkflowApprovalRequired: approvalRequired => dispatch(isWorkflowApprovalRequired(approvalRequired)),
    showEditDialog: (id, displayName, amount, amountType, description, currency) =>
      dispatch(showEditDialog(id, displayName, amount, amountType, description, currency))
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
    parentProject: state.getIn(["workflow", "parentProject"]),
    subProjectDetails: state.getIn(["workflow", "subProjectDetails"]),

    showWorkflowDetails: state.getIn(["workflow", "showDetails"]),
    showDetailsItemId: state.getIn(["workflow", "showDetailsItemId"]),
    showHistory: state.getIn(["notifications", "showHistory"]),
    historyItems: state.getIn(["workflow", "historyItems"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"]),
    budgetEditEnabled: state.getIn(["workflow", "subProjectBudgetEditEnabled"]),
    subProjectAmount: state.getIn(["workflow", "subProjectAmount"]),
    workflowDocuments: state.getIn(["documents", "tempDocuments"]),
    validatedDocuments: state.getIn(["documents", "validatedDocuments"]),
    users: state.getIn(["login", "user"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer));
