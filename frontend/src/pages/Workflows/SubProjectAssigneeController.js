import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneeDialog from "../Common/AssigneeDialog";
import { hideSubProjectAssignee } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class SubProjectAssigneeController extends Component {
  render() {
    return <AssigneeDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["workflow", "showSubProjectAssignee"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideSubProjectAssignee())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectAssigneeController)));
