import React, { Component } from "react";
import { connect } from "react-redux";
import AssigneesDialog from "../Common/AssigneesDialog";
import { hideSubProjectAssignees } from "./actions";
import withInitialLoading from "../Loading/withInitialLoading";
import { toJS } from "../../helper";
import { fetchUser } from "../Login/actions";

class SubProjectAssigneesController extends Component {
  render() {
    return <AssigneesDialog {...this.props} />;
  }
}

const mapStateToProps = state => {
  return {
    show: state.getIn(["workflow", "showSubProjectAssignees"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onClose: () => dispatch(hideSubProjectAssignees())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(SubProjectAssigneesController)));
