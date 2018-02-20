import React, { Component } from 'react';
import { connect } from 'react-redux';
import { fetchUserWithToken } from './actions';

import ProgressIndicator from '../Loading/ProgressIndicator';


class ProgressIndicatorContainer extends Component {

  constructor(props) {
    super(props);

    this.state = {
      completed: 0,
    };
  }

  componentDidMount() {
    this.timer = setTimeout(() => this.progress(30), 10);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  progress(completed) {
    if (completed > 100) {
      this.setState({ completed: 100 });
      this.props.fetchUserWithToken()
    } else {
      this.setState({ completed });
      const diff = Math.random() * 10;
      this.timer = setTimeout(() => this.progress(completed + diff), 80);
    }
  }
  render() {
    return <ProgressIndicator completed={this.state.completed} {...this.props} />
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUserWithToken: () => dispatch(fetchUserWithToken()),
  };
}

const mapStateToProps = (state) => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressIndicatorContainer);

