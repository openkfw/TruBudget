import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  withStyles
} from "@material-ui/core";
import React from "react";

import strings from "../../localizeStrings";

const FAST_CONNECTION_PING = 500;
const AVERAGE_CONNECTION_PING = 2000;
const SLOW_CONNECTION_PING = 4000;

const styles = theme => ({
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "100%",
    marginTop: "40px"
  },
  shapeCircle: {
    backgroundColor: theme.palette.primary.secondary,
    width: 20,
    height: 20,
    borderRadius: "50%"
  }
});

const getConnectionDescription = ping => {
  if (!ping) {
    return {
      circleColor: "red",
      connectionDescription: strings.status.not_connected
    };
  }
  ping = Number(ping);
  if (ping <= FAST_CONNECTION_PING) {
    return {
      circleColor: "green",
      connectionDescription: strings.status.fast
    };
  }
  if (ping <= AVERAGE_CONNECTION_PING) {
    return {
      circleColor: "yellow",
      connectionDescription: strings.status.average
    };
  }
  if (ping <= SLOW_CONNECTION_PING) {
    return {
      circleColor: "orange",
      connectionDescription: strings.status.slow
    };
  }
  return {
    circleColor: "red",
    connectionDescription: strings.status.very_slow
  };
};

function renderCircularProgressRow(service) {
  return (
    <TableRow key={`status-${service}-row`}>
      <TableCell>{service}</TableCell>
      <TableCell>
        <CircularProgress size={20} />
      </TableCell>
      <TableCell>
        <CircularProgress size={20} />
      </TableCell>
      <TableCell style={{ textAlign: "-webkit-center" }}>
        <CircularProgress size={20} />
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

const StatusTable = props => {
  const {
    versions,
    classes,
    isEmailServiceAvailable,
    isExportServiceAvailable,
    isFetchingVersions,
    isFetchingEmailVersion,
    isFetchingExportVersion
  } = props;

  const isFetchingVersion = serviceName => {
    const standardServices = ["frontend", "api", "blockchain", "multichain"];
    if (
      (isFetchingEmailVersion && serviceName === "emailService") ||
      (isFetchingExportVersion && serviceName === "exportService") ||
      (isFetchingVersions && standardServices.includes(serviceName))
    ) {
      return true;
    } else {
      return false;
    }
  };

  const renderEmptyStatusRow = service => {
    const release = filteredVersions[service].release || "?";
    return (
      <TableRow key={`status-${service}-row`}>
        <TableCell>{service}</TableCell>
        <TableCell data-test={`release-version-${service}`}>{release}</TableCell>
        <TableCell />
        <TableCell />
        <TableCell />
      </TableRow>
    );
  };

  const renderStatusRow = service => {
    const ping = filteredVersions[service].ping;
    const release = filteredVersions[service].release || "?";
    const { circleColor, connectionDescription } = getConnectionDescription(ping);
    const circle = <div className={classes.shapeCircle} style={{ backgroundColor: circleColor }} />;
    if (!isFetchingVersion(service)) {
      return (
        <TableRow key={`status-${service}-row`}>
          <TableCell>{service}</TableCell>
          <TableCell data-test={`release-version-${service}`}>{release}</TableCell>
          <TableCell>
            <Typography>{ping ? `${ping.toFixed(0)} ms` : strings.status.no_ping_available}</Typography>
          </TableCell>
          <TableCell style={{ textAlign: "-webkit-center" }}>{circle}</TableCell>
          <TableCell>
            <Typography>{connectionDescription}</Typography>
          </TableCell>
        </TableRow>
      );
    } else {
      return renderCircularProgressRow(service);
    }
  };

  // Do not show service versions of deactivated services
  const filteredVersions = Object.keys(versions).reduce((filtered, serviceName) => {
    if (
      (!isEmailServiceAvailable && serviceName === "emailService") ||
      (!isExportServiceAvailable && serviceName === "exportService")
    ) {
      return filtered;
    }
    filtered[serviceName] = versions[serviceName];
    return filtered;
  }, {});

  return (
    <div data-test="status-dashboard" className={classes.container}>
      <div className={classes.customWidth}>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{strings.status.service}</TableCell>
                <TableCell>{strings.status.version}</TableCell>
                <TableCell>{strings.status.ping}</TableCell>
                <TableCell style={{ textAlign: "center" }}>{strings.status.connection}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody data-test="status-table-body">
              {Object.keys(filteredVersions).map(service => {
                if (service === "frontend") {
                  return renderEmptyStatusRow(service);
                } else {
                  return renderStatusRow(service);
                }
              })}
            </TableBody>
          </Table>
        </Paper>
      </div>
    </div>
  );
};

export default withStyles(styles)(StatusTable);
