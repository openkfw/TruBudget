import React, { Component } from "react";
import { connect } from "react-redux";
import SubprojectDialog from "./SubprojectDialog";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import {
  hideSubprojectDialog,
  hideSubprojectPreviewDialog,
  storeSubProjectName,
  createSubProject,
  editSubproject,
  storeSubProjectAmount,
  storeSubProjectComment,
  storeSubProjectCurrency,
  editSubProjects
} from "./actions";
import { storeSnackbarMessage } from "../Notifications/actions";

class SubprojectDialogContainer extends Component {
  render() {
    return (
      <div>
        <SubprojectDialog {...this.props} />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    subprojectToAdd: state.getIn(["detailview", "subprojectToAdd"]),
    creationDialogShown: state.getIn(["detailview", "creationDialogShown"]),
    previewDialogShown: state.getIn(["detailview", "previewDialogShown"]),
    editDialogShown: state.getIn(["detailview", "editDialogShown"]),
    subProjects: state.getIn(["detailview", "subProjects"]),
    dialogTitle: state.getIn(["detailview", "dialogTitle"]),
    previewDialogTitle: state.getIn(["detailview", "previewDialogTitle"]),
    projectCurrency: state.getIn(["detailview", "projectCurrency"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    hideSubprojectDialog: () => dispatch(hideSubprojectDialog()),
    hidePreviewDialog: () => dispatch(hideSubprojectPreviewDialog()),
    storeSubProjectName: name => dispatch(storeSubProjectName(name)),
    createSubProject: (subprojectName, amount, description, currency, parentName) =>
      dispatch(createSubProject(parentName, subprojectName, amount, description, currency)),
    editSubproject: (pId, sId, changes) => dispatch(editSubproject(pId, sId, changes)),
    storeSubProjectAmount: amount => dispatch(storeSubProjectAmount(amount)),
    storeSubProjectComment: comment => dispatch(storeSubProjectComment(comment)),
    storeSubProjectCurrency: currency => dispatch(storeSubProjectCurrency(currency)),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    editSubProjects: subprojects => dispatch(editSubProjects(subprojects))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubprojectDialogContainer)));
