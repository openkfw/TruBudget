import React, { Component } from 'react';
import { connect } from 'react-redux';

import DocumentOverview from './DocumentOverview';

class DocumentOverviewContainer extends Component {
  render() {
    return <DocumentOverview {...this.props} />;
  }
}

const mapDispatchToProps = (dispatch) => {
  return {};
}

const mapStateToProps = (state) => {
  return {
    documents: state.getIn(['documents', 'hashedDocuments']).toJS()
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentOverviewContainer);
