import React, { Component } from "react";
import { connect } from "react-redux";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { withStyles } from "@material-ui/core";
import WorkflowDialog from "./WorkflowDialog";
import WorkflowPreviewDialog from "./WorkflowPreviewDialog";
import {
  createWorkflowItem,
  editWorkflowItem,
  storeWorkflowComment,
  storeWorkflowCurrency,
  storeWorkflowAmount,
  storeWorkflowAmountType,
  storeWorkflowName,
  storeWorkflowStatus,
  hideWorkflowDialog,
  setCurrentStep,
  storeWorkflowDocument,
  hideWorkflowItemPreview
} from "./actions";
import { storeSnackbarMessage } from "../Notifications/actions";

const styles = {};

class WorkflowDialogContainer extends Component {
  createWorkflowItem = (displayName, amount, amountType, currency, description, status, workflowDocuments) => {
    const path = this.props.location.pathname.split("/");
    const projectId = path[2];
    const subProjectId = path[3];
    this.props.createItem(
      projectId,
      subProjectId,
      displayName,
      amount,
      amountType,
      currency,
      description,
      status,
      workflowDocuments
    );
  };

  render() {
    return (
      <div>
        <WorkflowDialog
          createWorkflowItem={this.createWorkflowItem}
          onDialogCancel={this.props.hideWorkflowDialog}
          {...this.props}
        />
        <WorkflowPreviewDialog {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    previewDialogShown: state.getIn(["workflow", "previewDialogShown"]),
    workflowToAdd: state.getIn(["workflow", "workflowToAdd"]),
    creationDialogShown: state.getIn(["workflow", "creationDialogShown"]),
    editDialogShown: state.getIn(["workflow", "editDialogShown"]),
    dialogTitle: state.getIn(["workflow", "dialogTitle"]),
    workflowItems: state.getIn(["workflow", "workflowItems"]),
    currentStep: state.getIn(["workflow", "currentStep"]),
    currency: state.getIn(["workflow", "currency"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createItem: (projectId, subprojectId, displayName, amount, amountType, currency, description, status, documents) =>
      dispatch(
        createWorkflowItem(
          projectId,
          subprojectId,
          displayName,
          amount,
          amountType,
          currency,
          description,
          status,
          documents
        )
      ),
    editWorkflowItem: (pId, sId, wId, changes) => dispatch(editWorkflowItem(pId, sId, wId, changes)),
    storeWorkflowComment: comment => dispatch(storeWorkflowComment(comment)),
    storeWorkflowCurrency: currency => dispatch(storeWorkflowCurrency(currency)),
    storeWorkflowAmount: amount => dispatch(storeWorkflowAmount(amount)),
    storeWorkflowAmountType: type => dispatch(storeWorkflowAmountType(type)),
    storeWorkflowName: name => dispatch(storeWorkflowName(name)),
    storeWorkflowStatus: state => dispatch(storeWorkflowStatus(state)),
    hideWorkflowDialog: () => dispatch(hideWorkflowDialog()),
    hideWorkflowItemPreview: () => dispatch(hideWorkflowItemPreview()),
    setCurrentStep: step => dispatch(setCurrentStep(step)),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    storeWorkflowDocument: (payload, name) => dispatch(storeWorkflowDocument(payload, name))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withInitialLoading(toJS(withStyles(styles)(WorkflowDialogContainer)))
);
