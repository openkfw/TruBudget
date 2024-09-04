import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";

import strings from "../../localizeStrings";

import { fetchAppLatestVersion, upgradeAppToLatestVersion } from "./actions";

import "./StatusTable.scss";

const FAST_CONNECTION_PING = 500;
const AVERAGE_CONNECTION_PING = 2000;
const SLOW_CONNECTION_PING = 4000;

const getConnectionDescription = (ping) => {
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
      <TableCell className="centered-table-cell">
        <CircularProgress size={20} />
      </TableCell>
      <TableCell />
    </TableRow>
  );
}

function isVersionHigher(version1, version2) {
  // check if versions are in correct format using regex
  if (!version1 || !version2 || !/^\d+\.\d+\.\d+$/.test(version1) || !/^\d+\.\d+\.\d+$/.test(version2)) {
    return false;
  }

  // Split the version strings into arrays of integers
  const v1 = version1.split(".").map(Number);
  const v2 = version2.split(".").map(Number);

  // Compare major, minor, and patch versions
  for (let i = 0; i < 3; i++) {
    if (v1[i] > v2[i]) {
      return true;
    } else if (v1[i] < v2[i]) {
      return false;
    }
    // If they're equal, continue to the next component
  }

  // If all components are equal, return false
  return false;
}

const StatusTable = (props) => {
  const {
    versions,
    isEmailServiceAvailable,
    isExportServiceAvailable,
    isFetchingVersions,
    isFetchingEmailVersion,
    isFetchingExportVersion
  } = props;

  const dispatch = useDispatch();

  const latestVersion = useSelector((state) => state.getIn(["status", "latestVersion"]));
  const currentApiVersion = useSelector((state) => state.getIn(["status", "versions", "api", "release"]));
  const userName = useSelector((state) => state.getIn(["login", "id"]));

  useEffect(() => {
    if (userName === "root") {
      dispatch(fetchAppLatestVersion());
    }
  }, [dispatch, userName]);

  const upgradeApp = useCallback(() => {
    dispatch(upgradeAppToLatestVersion(latestVersion));
    // axios
    //   .post("/api/app.upgrade", {
    //     apiVersion: "1.0",
    //     data: {
    //       version: latestVersion
    //     }
    //   })
    //   .then((response) => {
    //     console.log(response);
    //   });
  }, [dispatch, latestVersion]);

  const isFetchingVersion = (serviceName) => {
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

  const renderEmptyStatusRow = (service) => {
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

  const renderStatusRow = (service) => {
    const ping = filteredVersions[service].ping;
    const release = filteredVersions[service].release || "?";
    const { circleColor, connectionDescription } = getConnectionDescription(ping);
    const circle = <div className="status-circle" style={{ backgroundColor: circleColor }} />;
    if (!isFetchingVersion(service)) {
      return (
        <TableRow key={`status-${service}-row`}>
          <TableCell>{service}</TableCell>
          <TableCell data-test={`release-version-${service}`}>{release}</TableCell>
          <TableCell>
            <Typography>{ping ? `${ping.toFixed(0)} ms` : strings.status.no_ping_available}</Typography>
          </TableCell>
          <TableCell className="centered-table-cell">{circle}</TableCell>
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
      (!isExportServiceAvailable && serviceName === "exportService") ||
      ((!versions["storage"] || !versions["storage"].ping) && serviceName === "storage")
    ) {
      return filtered;
    }
    filtered[serviceName] = versions[serviceName];
    return filtered;
  }, {});

  return (
    <div data-test="status-dashboard" className="table-container">
      <div className="custom-width">
        {latestVersion && isVersionHigher(latestVersion, currentApiVersion) && (
          <div>
            <p>
              New version of TruBudget is available. Backup your data and click{" "}
              <Button onClick={upgradeApp} variant="contained">
                Upgrade to {latestVersion}
              </Button>
            </p>
            <p>This will turn off, upgrade and restart the application.</p>
          </div>
        )}
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{strings.status.service}</TableCell>
                <TableCell>{strings.status.version}</TableCell>
                <TableCell>{strings.status.ping}</TableCell>
                <TableCell className="centered-table-cell">{strings.status.connection}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody data-test="status-table-body">
              {Object.keys(filteredVersions).map((service) => {
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

export default StatusTable;
