import React, { Component } from "react";
import { connect } from "react-redux";

import { toJS } from "../../helper";
import withInitialLoading from "../Loading/withInitialLoading";
import { fetchEmailServiceVersion, fetchExportServiceVersion, fetchVersions } from "./actions";
import { showSnackbar, storeSnackbarMessage } from "../Notifications/actions";
import StatusTable from "./StatusTable";

class StatusContainer extends Component {
  componentDidMount() {
    this.props.fetchVersions();
    if (this.props.isEmailServiceAvailable) this.props.fetchEmailServiceVersion();
    if (this.props.isExportServiceAvailable) this.props.fetchExportServiceVersion();
  }

  render() {
    const {
      versions,
      isEmailServiceAvailable,
      isExportServiceAvailable,
      isFetchingVersions,
      isFetchingEmailVersion,
      isFetchingExportVersion
    } = this.props;
    return (
      <StatusTable
        versions={versions}
        isEmailServiceAvailable={isEmailServiceAvailable}
        isExportServiceAvailable={isExportServiceAvailable}
        isFetchingVersions={isFetchingVersions}
        isFetchingEmailVersion={isFetchingEmailVersion}
        isFetchingExportVersion={isFetchingExportVersion}
      />
    );
  }
}

const mapStateToProps = state => {
  return {
    versions: state.getIn(["status", "versions"]),
    isFetchingVersions: state.getIn(["status", "isFetchingVersions"]),
    isFetchingEmailVersion: state.getIn(["status", "isFetchingEmailVersion"]),
    isFetchingExportVersion: state.getIn(["status", "isFetchingExportVersion"]),
    isEmailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    isExportServiceAvailable: state.getIn(["login", "exportServiceAvailable"])
  };
};

const mapDispatchToProps = dispatch => {
  return {
    showErrorSnackbar: () => dispatch(showSnackbar(true)),
    showSnackbar: () => dispatch(showSnackbar()),
    storeSnackbarMessage: message => dispatch(storeSnackbarMessage(message)),
    fetchVersions: () => dispatch(fetchVersions()),
    fetchEmailServiceVersion: () => dispatch(fetchEmailServiceVersion()),
    fetchExportServiceVersion: () => dispatch(fetchExportServiceVersion())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withInitialLoading(toJS(StatusContainer)));
