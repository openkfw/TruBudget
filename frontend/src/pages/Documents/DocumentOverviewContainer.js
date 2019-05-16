import React, { Component } from "react";
import { connect } from "react-redux";

import DocumentOverview from "./DocumentOverview";
import { validateDocument } from "./actions";
import { toJS } from "../../helper";

class DocumentOverviewContainer extends Component {
  render() {
    return <DocumentOverview {...this.props} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    validateDocument: (hash, base64String, id) => dispatch(validateDocument(hash, base64String, id))
  };
};

const mapStateToProps = state => {
  return {
    validatedDocuments: state.getIn(["documents", "validatedDocuments"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(toJS(DocumentOverviewContainer));
