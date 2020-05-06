import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import { canAssignSubProject, canCloseSubProject, canViewSubProjectPermissions } from "../../permissions";
import globalStyles from "../../styles";
import { openAnalyticsDialog } from "../Analytics/actions";
import AdditionalInfo from "../Common/AdditionalInfo";
import { addDocument } from "../Documents/actions";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import { fetchUser } from "../Login/actions";
import { setSelectedView } from "../Navbar/actions";
import { openHistory } from "../Notifications/actions";
import SubprojectHistoryDrawer from "../SubProjects/SubprojectHistoryDrawer";
import {
  closeSubproject,
  closeWorkflowItem,
  closeWorkflowitemDetailsDialog,
  disableWorkflowEdit,
  enableSubProjectBudgetEdit,
  enableWorkflowEdit,
  fetchAllSubprojectDetails,
  hideWorkflowDetails,
  hideWorkflowDialog,
  hideWorkflowitemAdditionalData,
  isWorkflowApprovalRequired,
  liveUpdateSubproject,
  postSubProjectEdit,
  reorderWorkflowItems,
  saveWorkflowItemsBeforeSort,
  showCreateDialog,
  showEditDialog,
  showSubProjectAssignee,
  showWorkflowDetails,
  showWorkflowitemAdditionalData,
  showWorkflowItemPermissions,
  storeWorkflowItemsSelected,
  storeWorkflowType,
  updateWorkflowOrderOnState
} from "./actions";
import SubProjectDetails from "./SubProjectDetails";
import Workflow from "./Workflow";
import WorkflowBatchEditContainer from "./WorkflowBatchEditContainer";
import WorkflowDialogContainer from "./WorkflowDialogContainer";
import WorkflowItemPermissionsContainer from "./WorkflowItemPermissionsContainer";

class WorkflowContainer extends Component {
  constructor(props) {
    super(props);
    const path = props.location.pathname.split("/");
    this.projectId = path[2];
    this.subprojectId = path[3];
  }

  componentDidMount() {
    this.props.setSelectedView(this.subprojectId, "subProject");
    this.props.fetchAllSubprojectDetails(this.projectId, this.subprojectId, true);
    this.props.fetchUser();
  }

  componentWillUnmount() {
    this.props.hideWorkflowDetails();
    this.props.hideWorkflowDialog();
    this.props.disableWorkflowEdit();
  }

  closeSubproject = () => {
    const openWorkflowItems = this.props.workflowItems.find(wItem => wItem.data.status === "open");
    if (!openWorkflowItems) {
      this.props.closeSubproject(this.projectId, this.subprojectId);
    }
  };

  closeWorkflowItem = wId => this.props.closeWorkflowItem(this.projectId, this.subprojectId, wId);

  closeSubproject = () => this.props.closeSubproject(this.projectId, this.subprojectId, true);

  update = () => {
    this.props.updateSubProject(this.projectId, this.subprojectId);
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
            projectId={this.projectId}
            subprojectId={this.subprojectId}
            canViewPermissions={canViewPermissions}
            canAssignSubproject={canAssignSubproject}
            closeSubproject={this.closeSubproject}
            canCloseSubproject={canCloseSubproject}
          />

          {this.props.permissionDialogShown ? (
            <WorkflowItemPermissionsContainer projectId={this.projectId} subProjectId={this.subprojectId} />
          ) : null}
          <Workflow
            {...this.props}
            projectId={this.projectId}
            subProjectId={this.subprojectId}
            closeWorkflowItem={this.closeWorkflowItem}
          />
          <WorkflowDialogContainer location={this.props.location} />
          <AdditionalInfo
            resources={this.props.workflowItems}
            isAdditionalDataShown={this.props.isWorkflowitemAdditionalDataShown}
            hideAdditionalData={this.props.hideWorkflowitemAdditionalData}
            {...this.props}
          />
          <SubprojectHistoryDrawer projectId={this.projectId} subprojectId={this.subprojectId} />
          <WorkflowBatchEditContainer projectId={this.projectId} subProjectId={this.subprojectId} />
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
    openHistory: () => {
      dispatch(openHistory());
    },
    openWorkflowDetails: id => dispatch(showWorkflowDetails(id)),
    hideWorkflowDetails: () => dispatch(hideWorkflowDetails()),
    closeWorkflowitemDetailsDialog: () => dispatch(closeWorkflowitemDetailsDialog()),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true)),

    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),

    showWorkflowItemPermissions: (wId, wDisplayName) => dispatch(showWorkflowItemPermissions(wId, wDisplayName)),
    updateWorkflowOrderOnState: items => dispatch(updateWorkflowOrderOnState(items)),
    enableWorkflowEdit: () => dispatch(enableWorkflowEdit()),
    disableWorkflowEdit: () => dispatch(disableWorkflowEdit()),
    reorderWorkflowItems: (projectId, subProjectId, workflowItems) =>
      dispatch(reorderWorkflowItems(projectId, subProjectId, workflowItems)),
    storeWorkflowType: value => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    postSubProjectEdit: (parent, streamName, status, amount) =>
      dispatch(postSubProjectEdit(parent, streamName, status, amount)),
    fetchUser: () => dispatch(fetchUser(true)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog()),
    isWorkflowApprovalRequired: approvalRequired => dispatch(isWorkflowApprovalRequired(approvalRequired)),
    showEditDialog: (id, displayName, amount, exchangeRate, amountType, description, currency, documents) =>
      dispatch(showEditDialog(id, displayName, amount, exchangeRate, amountType, description, currency, documents)),
    saveWorkflowItemsBeforeSort: workflowItems => dispatch(saveWorkflowItemsBeforeSort(workflowItems)),
    addDocument: (payload, name) => dispatch(addDocument(payload, name)),
    storeWorkflowItemsSelected: workflowItems => dispatch(storeWorkflowItemsSelected(workflowItems)),
    openAnalyticsDialog: () => dispatch(openAnalyticsDialog()),
    showWorkflowitemAdditionalData: wId => dispatch(showWorkflowitemAdditionalData(wId)),
    hideWorkflowitemAdditionalData: () => dispatch(hideWorkflowitemAdditionalData())
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
    workflowDocuments: state.getIn(["documents", "tempDocuments"]),
    validatedDocuments: state.getIn(["documents", "validatedDocuments"]),
    users: state.getIn(["login", "user"]),
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"]),
    projectedBudgets: state.getIn(["workflow", "projectedBudgets"]),
    idForInfo: state.getIn(["workflow", "idForInfo"]),
    isWorkflowitemAdditionalDataShown: state.getIn(["workflow", "isWorkflowitemAdditionalDataShown"]),
    isLoading: state.getIn(["workflow", "isHistoryLoading"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    permissionDialogShown: state.getIn(["workflow", "showWorkflowPermissions"]),
    idsPermissionsUnassigned: state.getIn(["workflow", "idsPermissionsUnassigned"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer));
