import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import { withRouter } from "../../wrappers/withRouter";
import withInitialLoading from "../Loading/withInitialLoading";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import { fetchVersions, setStorageServiceAvailable } from "../Status/actions";

import {
  addWorkflowitemTag,
  assignWorkflowItem,
  createWorkflowFromTemplateAction,
  createWorkflowItemAction,
  defaultWorkflowExchangeRate,
  editWorkflowItem,
  hideWorkflowDialog,
  removeWorkflowitemTag,
  setCurrentStep,
  storeWorkflowAmount,
  storeWorkflowAmountType,
  storeWorkflowAssignee,
  storeWorkflowComment,
  storeWorkflowCurrency,
  storeWorkflowDocument,
  storeWorkflowDocumentExternalLink,
  storeWorkflowDueDate,
  storeWorkflowExchangeRate,
  storeWorkflowitemType,
  storeWorkflowName,
  storeWorkflowStatus,
  storeWorkflowTemplate
} from "./actions";
import WorkflowDialog from "./WorkflowDialog";

class WorkflowDialogContainer extends Component {
  createWorkflowItem = (
    displayName,
    amount,
    exchangeRate,
    amountType,
    currency,
    description,
    status,
    workflowDocuments,
    dueDate,
    workflowitemType,
    projectDisplayName,
    subprojectDisplayName,
    tags
  ) => {
    const path = this.props.router.location.pathname.split("/");
    const projectId = path[2];
    const subProjectId = path[3];
    const assignee = this.props.selectedAssignee;
    const assigneeDisplayName = this.props.users.find((u) => u.id === assignee).displayName;

    this.props.createWorkflowitemSuper(
      projectId,
      subProjectId,
      displayName,
      amount,
      exchangeRate,
      amountType,
      currency,
      description,
      status,
      workflowDocuments,
      dueDate,
      workflowitemType,
      projectDisplayName,
      subprojectDisplayName,
      assignee,
      assigneeDisplayName,
      tags
    );
  };

  createWorkflowFromTemplate = ({
    amount,
    amountType,
    currency,
    description,
    displayName,
    dueDate,
    exchangeRate,
    projectDisplayName,
    status,
    subprojectDisplayName,
    workflowDocuments,
    workflowitemType,
    workflowitems
  }) => {
    const path = this.props.router.location.pathname.split("/");
    const projectId = path[2];
    const subprojectId = path[3];
    const assignee = this.props.selectedAssignee;
    const assigneeDisplayName = this.props.users.find((u) => u.id === assignee).displayName;

    this.props.createWorkflowFromTemplateSuper({
      projectId,
      subprojectId,
      displayName,
      amount,
      exchangeRate,
      amountType,
      currency,
      description,
      status,
      workflowDocuments,
      dueDate,
      workflowitemType,
      projectDisplayName,
      subprojectDisplayName,
      assignee,
      assigneeDisplayName,
      workflowitems
    });
  };

  render() {
    return (
      <WorkflowDialog
        {...this.props}
        createWorkflowItem={this.createWorkflowItem}
        createWorkflowFromTemplate={this.createWorkflowFromTemplate}
        onDialogCancel={this.props.hideWorkflowDialog}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    creationDialogShown: state.getIn(["workflow", "creationDialogShown"]),
    currency: state.getIn(["workflow", "currency"]),
    currentStep: state.getIn(["workflow", "currentStep"]),
    currentUser: state.getIn(["login", "id"]),
    dialogTitle: state.getIn(["workflow", "dialogTitle"]),
    editDialogShown: state.getIn(["workflow", "editDialogShown"]),
    fixedWorkflowitemType: state.getIn(["workflow", "fixedWorkflowitemType"]),
    hasFixedWorkflowitemType: state.getIn(["workflow", "hasFixedWorkflowitemType"]),
    hasSubprojectValidator: state.getIn(["workflow", "hasSubprojectValidator"]),
    projectDisplayName: state.getIn(["workflow", "parentProject", "displayName"]),
    selectedAssignee: state.getIn(["workflow", "workflowToAdd", "assignee"]),
    storageServiceAvailable: state.getIn(["status", "storageServiceAvailable"]),
    subProjectCurrency: state.getIn(["workflow", "subProjectCurrency"]),
    subprojectDisplayName: state.getIn(["workflow", "displayName"]),
    subprojectValidator: state.getIn(["workflow", "subprojectValidator"]),
    tags: state.getIn(["workflow", "workflowToAdd", "tags"]),
    users: state.getIn(["login", "enabledUsers"]),
    versions: state.getIn(["status", "versions"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    workflowTemplate: state.getIn(["workflow", "workflowTemplate"]),
    workflowTemplates: state.getIn(["workflow", "workflowTemplates"]),
    workflowToAdd: state.getIn(["workflow", "workflowToAdd"])
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createWorkflowitemSuper: (...workflowitemData) => dispatch(createWorkflowItemAction(...workflowitemData)),
    createWorkflowFromTemplateSuper: (...data) => dispatch(createWorkflowFromTemplateAction(...data)),
    editWorkflowItem: (pId, sId, wId, changes) => dispatch(editWorkflowItem(pId, sId, wId, changes)),
    storeWorkflowComment: (comment) => dispatch(storeWorkflowComment(comment)),
    storeWorkflowCurrency: (currency) => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: (amount) => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowExchangeRate: (rate) => dispatch(storeWorkflowExchangeRate(rate)),
    storeWorkflowAmountType: (type) => dispatch(storeWorkflowAmountType(type)),
    storeWorkflowName: (name) => dispatch(storeWorkflowName(name)),
    storeWorkflowStatus: (state) => dispatch(storeWorkflowStatus(state)),
    storeWorkflowDueDate: (dueDate) => dispatch(storeWorkflowDueDate(dueDate)),
    storeWorkflowitemType: (workflowitemType) => dispatch(storeWorkflowitemType(workflowitemType)),
    storeWorkflowTemplate: (workflowTemplate) => dispatch(storeWorkflowTemplate(workflowTemplate)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog()),
    setCurrentStep: (step) => dispatch(setCurrentStep(step)),
    storeSnackbarMessage: (message) => dispatch(storeSnackbarMessage(message)),
    storeWorkflowDocument: (payload, fileName) => dispatch(storeWorkflowDocument(payload, fileName)),
    storeWorkflowDocumentExternalLink: (link, fileName) => dispatch(storeWorkflowDocumentExternalLink(link, fileName)),
    defaultWorkflowExchangeRate: (exchangeRate) => dispatch(defaultWorkflowExchangeRate(exchangeRate)),
    storeWorkflowAssignee: (assignee) => dispatch(storeWorkflowAssignee(assignee)),
    assignWorkflowItem: (
      projectId,
      projectDisplayName,
      subprojectId,
      subprojectDisplayName,
      workflowitemId,
      workflowitemDisplayName,
      assigneeId,
      assigneeDisplayName
    ) =>
      dispatch(
        assignWorkflowItem(
          projectId,
          projectDisplayName,
          subprojectId,
          subprojectDisplayName,
          workflowitemId,
          workflowitemDisplayName,
          assigneeId,
          assigneeDisplayName
        )
      ),
    fetchVersions: () => dispatch(fetchVersions()),
    setStorageServiceAvailable: (isAvailable) => dispatch(setStorageServiceAvailable(isAvailable)),
    addWorkflowitemTag: (tag) => dispatch(addWorkflowitemTag(tag)),
    removeWorkflowitemTag: (tag) => dispatch(removeWorkflowitemTag(tag)),
    showErrorSnackbar: () => dispatch(showSnackbar(true))
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(WorkflowDialogContainer)))
);
