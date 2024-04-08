import React from "react";
import dayjs from "dayjs";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";

import strings from "../../localizeStrings";

import "./ApprovedNodesTableEntry.scss";

const renderTimeStampString = (node) => {
  return node.lastSeen ? dayjs(node.lastSeen).format("MMM D, YYYY") : "";
};

const ApprovedNodesTableEntry = ({ nodeGroup, nodes }) => {
  const [open, setOpen] = React.useState(false);

  const renderTableRow = (node) => {
    const circle = (
      <div
        className={node.isConnected ? "circle green" : "circle red"}
        data-test={`status-${node.address.organization}`}
      />
    );
    const formatLastSeen = renderTimeStampString(node);

    return (
      <TableRow key={node.address.address}>
        <TableCell align="center" className="approved-node-cell">
          {" "}
          {node.address.address}{" "}
        </TableCell>
        <TableCell className="center-cell">{circle}</TableCell>
        <TableCell align="center">{formatLastSeen}</TableCell>
      </TableRow>
    );
  };

  const renderPermissionCell = (permissions) => {
    return permissions.includes("admin") ? (
      <TableCell>
        {permissions}
        <Tooltip title={strings.nodesDashboard.admin_description} placement="right">
          <InfoOutlinedIcon className="node-info-icon" />
        </Tooltip>
      </TableCell>
    ) : (
      <TableCell>{permissions}</TableCell>
    );
  };

  return (
    <React.Fragment>
      <TableRow key={nodeGroup.organization}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            data-test={`open-entry-${nodeGroup.organization}`}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {nodeGroup.organization}
        </TableCell>
        <TableCell> {nodeGroup.count} </TableCell>
        {renderPermissionCell(nodeGroup.permissions)}
      </TableRow>
      <TableRow>
        <TableCell className="no-padding-cell" colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box className="approved-node-box">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" className="approved-node-cell">
                      {strings.nodesDashboard.nodes} {strings.nodesDashboard.address}
                    </TableCell>
                    <TableCell align="center" className="approved-node-cell">
                      {strings.nodesDashboard.connection_status}
                    </TableCell>
                    <TableCell align="center" className="approved-node-cell">
                      {strings.nodesDashboard.last_seen}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nodes.map((node) => {
                    return node.address.organization === nodeGroup.organization ? renderTableRow(node) : null;
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};
export default ApprovedNodesTableEntry;
