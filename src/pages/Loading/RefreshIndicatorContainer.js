import React, { Component } from 'react';
import { connect } from 'react-redux';

import { showLoadingIndicator, hideLoadingIndicator, resetLoadingIndicator } from './actions';
import RefreshIndicator from './RefreshIndicator';

class RefreshIndicatorContainer extends Component {

  componentWillUnmount() {
    if (this.props.loadingVisible) this.props.resetLoadingIndicator();
  }

  render() {
    return (
      false ?
        <RefreshIndicator  {...this.props} /> : null
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showLoadingIndicator: () => dispatch(showLoadingIndicator()),
    hideLoadingIndicator: () => dispatch(hideLoadingIndicator()),
    resetLoadingIndicator: () => dispatch(resetLoadingIndicator()),
  };
}

const mapStateToProps = (state) => {
  return {
    loadingVisible: state.getIn(['loading', 'loadingVisible']),

  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RefreshIndicatorContainer);
