import React, { Component } from "react";
import { connect } from "react-redux";
import _isEqual from "lodash/isEqual";
import queryString from "query-string";

import Typography from "@mui/material/Typography";

import { convertToSearchBarString } from "../../helper";
import { toJS } from "../../helper";
import strings from "../../localizeStrings";
import { canAssignSubProject, canViewSubProjectPermissions } from "../../permissions";
import WebWorker from "../../WebWorker.js";
import { withRouter } from "../../wrappers/withRouter";
import { openAnalyticsDialog } from "../Analytics/actions";
import AdditionalInfo from "../Common/AdditionalInfo";
import worker from "../Common/filterProjects.worker.js";
import InformationDialog from "../Common/InformationDialog";
import { addDocument } from "../Documents/actions";
import LiveUpdates from "../LiveUpdates/LiveUpdates";
import { fetchUser } from "../Login/actions";
import { setSelectedView } from "../Navbar/actions";
import { openHistory } from "../Notifications/actions";
import SubProjectHistoryDrawer from "../SubProjects/SubProjectHistoryDrawer";

import {
  closeSubproject,
  closeWorkflowItem,
  closeWorkflowitemDetailsDialog,
  disableLiveUpdatesSubproject,
  disableWorkflowEdit,
  enableLiveUpdatesSubproject,
  enableSubProjectBudgetEdit,
  enableWorkflowEdit,
  fetchAllSubprojectDetails,
  fetchWorkflowitem,
  hideReasonDialog,
  hideWorkflowDetails,
  hideWorkflowDialog,
  hideWorkflowitemAdditionalData,
  isWorkflowApprovalRequired,
  liveUpdateSubproject,
  postSubProjectEdit,
  reorderWorkflowItems,
  saveWorkflowItemsBeforeSort,
  setTagsOnly,
  showCreateDialog,
  showEditDialog,
  showReasonDialog,
  showSubProjectAssignee,
  showWorkflowitemAdditionalData,
  showWorkflowItemPermissions,
  storeFilteredWorkflowitems,
  storeWorkflowItemsBulkAction,
  storeWorkflowitemSearchTerm,
  storeWorkflowItemsSelected,
  storeWorkflowSearchBarDisplayed,
  storeWorkflowSearchTermArray,
  storeWorkflowType,
  updateWorkflowOrderOnState
} from "./actions";
import SubProjectDetails from "./SubProjectDetails";
import Workflow from "./Workflow";
import WorkflowBatchEditContainer from "./WorkflowBatchEditContainer";
import WorkflowDialogContainer from "./WorkflowDialogContainer";
import WorkflowItemPermissionsContainer from "./WorkflowItemPermissionsContainer";

import "./WorkflowContainer.scss";

class WorkflowContainer extends Component {
  constructor(props) {
    super(props);
    const path = props.router.location.pathname.split("/");
    this.projectId = path[2];
    this.subprojectId = path[3];
    this.state = {
      isDataFetched: false
    };
  }

  componentDidMount() {
    this.props.setSelectedView(this.subprojectId, "subProject");
    this.props.fetchUser();
    this.props.fetchAllSubprojectDetails(this.projectId, this.subprojectId, true);
    this.setState({ isDataFetched: true });

    // Get Searchword from URL if available
    if (this.props.router.location.search) {
      const queryParameter = queryString.parse(this.props.router.location.search);
      const searchTermString = convertToSearchBarString(queryString.stringify(queryParameter));
      this.props.storeWorkflowitemSearchTerm(searchTermString);
      this.props.storeWorkflowSearchBarDisplayed(true);
    }
    this.worker = new WebWorker(worker);

    // Listen for postmessage from worker
    this.worker.addEventListener("message", (event) => {
      // worker uses property 'filteredProjects'
      const filteredWorkflowitems = event.data ? event.data.filteredProjects : this.props.workflowItems;
      const searchTerms = event.data.searchTerms;
      this.props.storeFilteredWorkflowitems(filteredWorkflowitems);
      this.props.storeWorkflowSearchTermArray(searchTerms);
    });
  }

  componentDidUpdate(prevProps) {
    const searchTermChanges = this.props.searchTerm !== prevProps.searchTerm;
    const workflowItemsChange = !_isEqual(this.props.workflowItems, prevProps.workflowItems);

    // Start searching
    if (this.props.searchTerm && (searchTermChanges || workflowItemsChange)) {
      this.worker.postMessage({ projects: this.props.workflowItems, searchTerm: this.props.searchTerm });
    }
    // Reset searchbar
    if (!this.props.searchTerm && prevProps.searchTerm) {
      this.props.storeFilteredWorkflowitems(this.props.workflowItems);
      this.props.storeWorkflowSearchTermArray([]);
    }
  }

  componentWillUnmount() {
    this.props.hideWorkflowDetails();
    this.props.hideWorkflowDialog();
    this.props.disableWorkflowEdit();
  }

  closeWorkflowItem = (wId) => this.props.closeWorkflowItem(this.projectId, this.subprojectId, wId, false, true);

  rejectWorkflowItem = (wId) => {
    this.props.rejectWorkflowItem(this.projectId, this.subprojectId, wId, true, true);
  };

  closeSubproject = () => this.props.closeSubproject(this.projectId, this.subprojectId, true);

  update = () => {
    this.props.updateSubProject(this.projectId, this.subprojectId);
  };

  addLiveUpdates = () => {
    return this.props.isLiveUpdatesSubprojectEnabled ? <LiveUpdates update={this.update} /> : null;
  };

  render() {
    const canAssignSubproject = canAssignSubProject(this.props.allowedIntents);
    const canCloseSubproject = this.props.currentUser === this.props.assignee;
    const canViewPermissions = canViewSubProjectPermissions(this.props.allowedIntents);
    return (
      <div>
        {!this.props.workflowSortEnabled ? this.addLiveUpdates() : null}
        <div className="inner-container">
          <div>
            <SubProjectDetails
              {...this.props}
              projectId={this.projectId}
              subprojectId={this.subprojectId}
              canViewPermissions={canViewPermissions}
              canAssignSubproject={canAssignSubproject}
              closeSubproject={this.closeSubproject}
              canCloseSubproject={canCloseSubproject}
              isDataLoading={this.props.isDataLoading}
            />

            {this.props.permissionDialogShown ? (
              <WorkflowItemPermissionsContainer projectId={this.projectId} subProjectId={this.subprojectId} />
            ) : null}
            <Workflow
              {...this.props}
              projectId={this.projectId}
              subProjectId={this.subprojectId}
              closeWorkflowItem={this.closeWorkflowItem}
              rejectWorkflowItem={this.rejectWorkflowItem}
              isDataLoading={this.props.isDataLoading}
              storeSearchTerm={this.props.storeWorkflowitemSearchTerm}
              searchTerm={this.props.searchTerm}
              searchBarDisplayed={this.props.searchBarDisplayed}
              searchTermArray={this.props.searchTerms}
            />
          </div>
          <WorkflowDialogContainer location={this.props.location} />
          <AdditionalInfo
            resources={this.props.workflowItems}
            isAdditionalDataShown={this.props.isWorkflowitemAdditionalDataShown}
            hideAdditionalData={this.props.hideWorkflowitemAdditionalData}
            {...this.props}
          />

          <SubProjectHistoryDrawer projectId={this.projectId} subprojectId={this.subprojectId} />
          <WorkflowBatchEditContainer projectId={this.projectId} subProjectId={this.subprojectId} />
          <InformationDialog
            dialogShown={this.props.isRejectReasonDialogShown}
            title={strings.workflow.workflow_reject_reason}
            content={<Typography>{this.props.rejectReason}</Typography>}
            handleClose={() => this.props.hideReasonDialog()}
            closeLabel={strings.common.ok}
          />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, _ownProps) => {
  return {
    fetchAllSubprojectDetails: (pId, sId, loading) => dispatch(fetchAllSubprojectDetails(pId, sId, loading)),
    showCreateDialog: () => dispatch(showCreateDialog()),
    updateSubProject: (pId, sId) => dispatch(liveUpdateSubproject(pId, sId)),
    showSubProjectAssignee: () => dispatch(showSubProjectAssignee()),
    openHistory: () => dispatch(openHistory()),
    openWorkflowDetails: (pId, sId, id, worflowDetailsInitialTab) =>
      dispatch(fetchWorkflowitem(pId, sId, id, true, worflowDetailsInitialTab)),
    hideWorkflowDetails: () => dispatch(hideWorkflowDetails()),
    closeWorkflowitemDetailsDialog: () => dispatch(closeWorkflowitemDetailsDialog()),
    closeSubproject: (pId, sId) => dispatch(closeSubproject(pId, sId, true)),
    closeWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, false, true)),
    rejectWorkflowItem: (pId, sId, wId) => dispatch(closeWorkflowItem(pId, sId, wId, true, true)),
    setSelectedView: (id, section) => dispatch(setSelectedView(id, section)),
    showWorkflowItemPermissions: (wId, wDisplayName) => dispatch(showWorkflowItemPermissions(wId, wDisplayName)),
    updateWorkflowOrderOnState: (items) => dispatch(updateWorkflowOrderOnState(items)),
    enableWorkflowEdit: () => dispatch(enableWorkflowEdit()),
    disableWorkflowEdit: () => dispatch(disableWorkflowEdit()),
    reorderWorkflowItems: (projectId, subProjectId, workflowItems) =>
      dispatch(reorderWorkflowItems(projectId, subProjectId, workflowItems)),
    storeWorkflowType: (value) => dispatch(storeWorkflowType(value)),
    enableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(true)),
    disableBudgetEdit: () => dispatch(enableSubProjectBudgetEdit(false)),
    postSubProjectEdit: (parent, streamName, status, amount) =>
      dispatch(postSubProjectEdit(parent, streamName, status, amount)),
    fetchUser: () => dispatch(fetchUser(true)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog()),
    isWorkflowApprovalRequired: (approvalRequired) => dispatch(isWorkflowApprovalRequired(approvalRequired)),
    showEditDialog: (
      id,
      displayName,
      amount,
      exchangeRate,
      amountType,
      description,
      currency,
      documents,
      dueDate,
      workflowitemType,
      tags
    ) =>
      dispatch(
        showEditDialog(
          id,
          displayName,
          amount,
          exchangeRate,
          amountType,
          description,
          currency,
          documents,
          dueDate,
          workflowitemType,
          tags
        )
      ),
    saveWorkflowItemsBeforeSort: (workflowItems) => dispatch(saveWorkflowItemsBeforeSort(workflowItems)),
    addDocument: (payload, name) => dispatch(addDocument(payload, name)),
    storeWorkflowItemsSelected: (workflowItems) => dispatch(storeWorkflowItemsSelected(workflowItems)),
    storeWorkflowItemsBulkAction: (bulkActionType) => dispatch(storeWorkflowItemsBulkAction(bulkActionType)),
    openAnalyticsDialog: () => dispatch(openAnalyticsDialog()),
    showWorkflowitemAdditionalData: (wId) => dispatch(showWorkflowitemAdditionalData(wId)),
    hideWorkflowitemAdditionalData: () => dispatch(hideWorkflowitemAdditionalData()),
    showReasonDialog: (rejectReason) => dispatch(showReasonDialog(rejectReason)),
    hideReasonDialog: () => dispatch(hideReasonDialog()),
    storeFilteredWorkflowitems: (filteredWorkflowitems) => dispatch(storeFilteredWorkflowitems(filteredWorkflowitems)),
    storeWorkflowitemSearchTerm: (searchTerm) => dispatch(storeWorkflowitemSearchTerm(searchTerm)),
    setTagsOnly: (tagsOnly) => dispatch(setTagsOnly(tagsOnly)),
    enableLiveUpdatesSubproject: () => dispatch(enableLiveUpdatesSubproject()),
    disableLiveUpdatesSubproject: () => dispatch(disableLiveUpdatesSubproject()),
    storeWorkflowSearchBarDisplayed: (workflowSearchBarDisplayed) =>
      dispatch(storeWorkflowSearchBarDisplayed(workflowSearchBarDisplayed)),
    storeWorkflowSearchTermArray: (searchTerms) => dispatch(storeWorkflowSearchTermArray(searchTerms))
  };
};

const mapStateToProps = (state) => {
  return {
    allowedIntents: state.getIn(["workflow", "allowedIntents"]),
    amount: state.getIn(["workflow", "amount"]),
    assignee: state.getIn(["workflow", "assignee"]),
    budgetEditEnabled: state.getIn(["workflow", "subProjectBudgetEditEnabled"]),
    created: state.getIn(["workflow", "created"]),
    currency: state.getIn(["workflow", "currency"]),
    currentUser: state.getIn(["login", "id"]),
    description: state.getIn(["workflow", "description"]),
    displayName: state.getIn(["workflow", "displayName"]),
    dueDate: state.getIn(["workflow", "dueDate"]),
    filteredWorkflowitems: state.getIn(["workflow", "filteredWorkflowitems"]),
    fixedWorkflowitemType: state.getIn(["workflow", "fixedWorkflowitemType"]),
    id: state.getIn(["workflow", "id"]),
    idForInfo: state.getIn(["workflow", "idForInfo"]),
    idsPermissionsUnassigned: state.getIn(["workflow", "idsPermissionsUnassigned"]),
    isDataLoading: state.getIn(["loading", "loadingVisible"]),
    isLiveUpdatesSubprojectEnabled: state.getIn(["workflow", "isLiveUpdatesSubprojectEnabled"]),
    isLoading: state.getIn(["workflow", "isHistoryLoading"]),
    isRejectReasonDialogShown: state.getIn(["workflow", "isRejectReasonDialogShown"]),
    isRoot: state.getIn(["navbar", "isRoot"]),
    isWorkflowitemAdditionalDataShown: state.getIn(["workflow", "isWorkflowitemAdditionalDataShown"]),
    parentProject: state.getIn(["workflow", "parentProject"]),
    permissionDialogShown: state.getIn(["workflow", "showWorkflowPermissions"]),
    projectedBudgets: state.getIn(["workflow", "projectedBudgets"]),
    rejectReason: state.getIn(["workflow", "rejectReason"]),
    searchTerm: state.getIn(["workflow", "searchTerm"]),
    searchBarDisplayed: state.getIn(["workflow", "searchBarDisplayed"]),
    searchTerms: state.getIn(["workflow", "searchTerms"]),
    selectedWorkflowItems: state.getIn(["workflow", "selectedWorkflowItems"]),
    showDetailsItem: state.getIn(["workflow", "showDetailsItem"]),
    showWorkflowDetails: state.getIn(["workflow", "showDetails"]),
    status: state.getIn(["workflow", "status"]),
    subProjectDetails: state.getIn(["workflow", "subProjectDetails"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    subprojectValidator: state.getIn(["workflow", "subprojectValidator"]),
    tagsOnly: state.getIn(["workflow", "searchOnlyTags"]), // todo remove
    users: state.getIn(["login", "enabledUsers"]),
    validatedDocuments: state.getIn(["documents", "validatedDocuments"]),
    worflowDetailsInitialTab: state.getIn(["workflow", "worflowDetailsInitialTab"]),
    workflowDocuments: state.getIn(["documents", "tempDocuments"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowMode: state.getIn(["workflow", "workflowMode"]),
    workflowItemsBeforeSort: state.getIn(["workflow", "workflowItemsBeforeSort"]),
    workflowitemsBulkAction: state.getIn(["workflow", "workflowitemsBulkAction"]),
    workflowSortEnabled: state.getIn(["workflow", "workflowSortEnabled"])
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(toJS(WorkflowContainer)));
