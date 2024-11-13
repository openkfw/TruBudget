import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import CircleIcon from "@mui/icons-material/Circle";
import DesktopMacOutlinedIcon from "@mui/icons-material/DesktopMacOutlined";
import {
  Button,
  Chip,
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
      circleColor: "#39F439",
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
    <TableRow key={`status-${service}-row`} className="status-table-row">
      <TableCell className="status-table-cell first-table-cell">{service}</TableCell>
      <TableCell className="status-table-cell">
        <CircularProgress size={20} />
      </TableCell>
      <TableCell className="status-table-cell">
        <CircularProgress size={20} />
      </TableCell>
      <TableCell className="status-table-cell">
        <CircularProgress size={20} />
      </TableCell>
      <TableCell className="status-table-cell" />
    </TableRow>
  );
}

function isVersionHigher(version1, version2) {
  // check if versions are in correct format using regex
  if (!version1 || !version2 || !/^v*\d+\.\d+\.\d+$/.test(version1) || !/^v*\d+\.\d+\.\d+$/.test(version2)) {
    return false;
  }

  // Split the version strings into arrays of integers
  const v1 = version1.replace("v", "").split(".").map(Number);
  const v2 = version2.replace("v", "").split(".").map(Number);

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
      <TableRow key={`status-${service}-row`} className="status-table-row">
        <TableCell className="status-table-cell first-table-cell">{service}</TableCell>
        <TableCell className="status-table-cell" data-test={`release-version-${service}`}>
          {release}
        </TableCell>
        <TableCell className="status-table-cell">-</TableCell>
        <TableCell className="status-table-cell">
          <Chip
            label="N/A"
            sx={{
              backgroundColor: "rgba(23, 68, 229, 0.1)",
              color: "rgba(63, 67, 77, 1)"
            }}
            size="small"
          />
        </TableCell>
        <TableCell className="status-table-cell">-</TableCell>
      </TableRow>
    );
  };

  const renderStatusRow = (service) => {
    const ping = filteredVersions[service].ping;
    const release = filteredVersions[service].release || "?";
    const { circleColor, connectionDescription } = getConnectionDescription(ping);
    const circle = (
      <Chip
        label={strings.status.connected}
        sx={{
          backgroundColor: "rgba(23, 68, 229, 0.1)",
          color: "rgba(63, 67, 77, 1)"
        }}
        size="small"
        icon={
          <CircleIcon
            color="info"
            sx={{
              backgroundColor: "white",
              color: circleColor,
              borderRadius: "100%",
              width: "0.75rem",
              height: "0.75rem"
            }}
          />
        }
      />
    );
    if (!isFetchingVersion(service)) {
      return (
        <TableRow key={`status-${service}-row`} className="status-table-row">
          <TableCell className="status-table-cell first-table-cell">{service}</TableCell>
          <TableCell className="status-table-cell" data-test={`release-version-${service}`}>
            {release}
          </TableCell>
          <TableCell className="status-table-cell">
            {ping ? `${ping.toFixed(0)} ms` : strings.status.no_ping_available}
          </TableCell>
          <TableCell className="status-table-cell">{circle}</TableCell>
          <TableCell className="status-table-cell">{connectionDescription}</TableCell>
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
        <Paper sx={{ padding: "1.5rem" }}>
          <div className="title-row">
            <DesktopMacOutlinedIcon fontSize="small" />
            <Typography className="status-card-title">{strings.navigation.service_status}</Typography>
          </div>
          <Table>
            <TableHead>
              <TableRow className="status-table-header">
                <TableCell className="status-header-cell first-table-cell">{strings.status.service}</TableCell>
                <TableCell className="status-header-cell">{strings.status.version}</TableCell>
                <TableCell className="status-header-cell">{strings.status.ping}</TableCell>
                <TableCell className="status-header-cell">{strings.status.connection}</TableCell>
                <TableCell className="status-header-cell">{strings.status.speed}</TableCell>
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
