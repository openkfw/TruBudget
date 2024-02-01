import { Component } from "react";

import config from "../../config";

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
    const { update, interval = config.pollingInterval, immediately = false } = this.props;
    if (this.timer === undefined) {
      this.timer = setInterval(() => update(), interval);
    }

    if (immediately) update();
  }

  stopLiveUpdates() {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  render() {
    return null;
  }
}

export default LiveUpdates;
