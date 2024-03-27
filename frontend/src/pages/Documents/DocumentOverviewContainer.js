import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";

import { deleteDocument, downloadDocument, validateDocumentClientside } from "./actions";
import DocumentOverview from "./DocumentOverview";

class DocumentOverviewContainer extends Component {
  render() {
    return <DocumentOverview {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    validateDocument: ({ hash, newHash, projectId, subprojectId, workflowitemId, documentId }) =>
      dispatch(validateDocumentClientside({ hash, newHash, projectId, subprojectId, workflowitemId, documentId })),
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
