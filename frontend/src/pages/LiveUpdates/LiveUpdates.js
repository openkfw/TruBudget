import { Component } from "react";

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
    const { update, interval = 5000, immediatly = false } = this.props;
    if (this.timer === undefined) {
      this.timer = setInterval(() => update(), interval);
    }

    if (immediatly) update();
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
