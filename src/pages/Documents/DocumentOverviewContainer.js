import React, { Component } from 'react';
import { connect } from 'react-redux';

import DocumentOverview from './DocumentOverview';
import { validateDocument } from './actions';

class DocumentOverviewContainer extends Component {
  render() {
    return <DocumentOverview {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    validateDocument: (hash, payload) => dispatch(validateDocument(hash, payload))
  };
}

const mapStateToProps = (state) => {
  return {
    documents: state.getIn(['documents', 'hashedDocuments']).toJS()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentOverviewContainer);
