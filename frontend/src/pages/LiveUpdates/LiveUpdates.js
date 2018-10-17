import { Component } from "react";
import { connect } from "react-redux";

class LiveUpdates extends Component {
  constructor(props) {
    super(props);

    this.timer = undefined;
  }
  componentDidMount() {
    this.startLiveUpdates();
  }

  componentWillUnmount() {
    this.stopLiveUpdates();
  }

  startLiveUpdates() {
    if (this.timer === undefined) {
      this.timer = setInterval(() => this.update(), 5000);
    }
  }

  stopLiveUpdates() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  update() {
    this.props.updateFunc();
  }

  render() {
    return null;
  }
}

export default connect()(LiveUpdates);
