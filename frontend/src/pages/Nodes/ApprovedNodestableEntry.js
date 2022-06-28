import React from "react";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import Collapse from "@mui/material/Collapse";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import strings from "../../localizeStrings";
import TableBody from "@mui/material/TableBody";
import Tooltip from "@mui/material/Tooltip";
import dayjs from "dayjs";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const styles = {
  shapeCircle: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    display: "block",
    margin: "0 auto"
  },
  box: {
    margin: 1,
    marginLeft: 35,
    marginRight: 35,
    paddingLeft: 0,
    paddingRight: 0
  },
  cell: {
    minWidth: "250px",
    maxWidth: "250px"
  },
  infoIcon: {
    marginLeft: "5px",
    marginBottom: "-7px",
    fontSize: "x-large",
    color: "dimgrey"
  }
};

const renderTimeStampString = node => {
  return node.lastSeen ? dayjs(node.lastSeen).format("MMM D, YYYY") : "";
};

const ApprovedNodestableEntry = ({ nodeGroup, nodes }) => {
  const [open, setOpen] = React.useState(false);

  const renderTableRow = node => {
    const circleColor = node.isConnected ? "green" : "red";
    const circle = (
      <div
        style={{ ...styles.shapeCircle, backgroundColor: circleColor }}
        data-test={`status-${node.address.organization}`}
      />
    );
    const formatLastSeen = renderTimeStampString(node);

    return (
      <TableRow key={node.address.address}>
        <TableCell align="center" style={styles.cell}>
          {" "}
          {node.address.address}{" "}
        </TableCell>
        <TableCell style={{ textAlign: "-webkit-center" }}>{circle}</TableCell>
        <TableCell align="center">{formatLastSeen}</TableCell>
      </TableRow>
    );
  };

  const renderPermissionCell = permissions => {
    return permissions.includes("admin") ? (
      <TableCell>
        {permissions}
        <Tooltip title={strings.nodesDashboard.admin_description} placement="right">
          <InfoOutlinedIcon style={styles.infoIcon} />
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
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box style={styles.box}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center" style={styles.cell}>
                      {strings.nodesDashboard.nodes} {strings.nodesDashboard.address}
                    </TableCell>
                    <TableCell align="center" style={styles.cell}>
                      {strings.nodesDashboard.connection_status}
                    </TableCell>
                    <TableCell align="center" style={styles.cell}>
                      {strings.nodesDashboard.last_seen}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {nodes.map(node => {
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
export default ApprovedNodestableEntry;
