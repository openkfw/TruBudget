import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";

import { deleteDocument, downloadDocument, validateDocument } from "./actions";
import DocumentOverview from "./DocumentOverview";

class DocumentOverviewContainer extends Component {
  render() {
    return <DocumentOverview {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    validateDocument: (hash, base64String, id, projectId, subprojectId, workflowitemId) =>
      dispatch(validateDocument(hash, base64String, id, projectId, subprojectId, workflowitemId)),
    downloadDocument: (projectId, subprojectId, workflowitemId, documentId) =>
      dispatch(downloadDocument(projectId, subprojectId, workflowitemId, documentId)),
    deleteDocument: (projectId, subprojectId, workflowitemId, documentId) =>
      dispatch(deleteDocument(projectId, subprojectId, workflowitemId, documentId))
  };
};

const mapStateToProps = (state) => {
  return {
    validatedDocuments: state.getIn(["documents", "validatedDocuments"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(DocumentOverviewContainer));
