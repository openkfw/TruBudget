import React from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";

import strings from "../../localizeStrings";
import DatePicker from "../Common/DatePicker";
import DropDown from "../Common/NewDropdown";

import "./FilterMenu.scss";

const FilterMenu = (props) => {
  const {
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
    handleReset,
    assigneeId,
    setAssigneeId,
    users
  } = props;

  return (
    <Box data-test="filter-menu">
      <Box className="filter-menu">
        <Box>
          <DatePicker
            className="date-picker"
            id="filter-start"
            label={strings.history.start_date}
            name="start"
            datetime={startDate}
            onChange={(selectedDate) => setStartDate(selectedDate)}
            onDelete={() => setStartDate(null)}
          />
          <DatePicker
            className="date-picker"
            id="filter-end"
            label={strings.history.end_date}
            name="end"
            datetime={endDate}
            onChange={(selectedDate) => setEndDate(selectedDate)}
            onDelete={() => setEndDate(null)}
          />
        </Box>
        <Box>
          <DropDown
            className="filter-dropdown"
            value={status}
            floatingLabel={strings.common.status}
            onChange={(x) => setStatus(x)}
            id="status-select"
          >
            <MenuItem key={"status-all"} value={"all"}>
              {strings.common.all}
            </MenuItem>
            <MenuItem key={"status-open"} value={"open"}>
              {strings.common.open}
            </MenuItem>
            <MenuItem key={"status-closed"} value={"closed"}>
              {strings.common.closed}
            </MenuItem>
          </DropDown>

          <DropDown
            className="filter-dropdown"
            value={assigneeId}
            floatingLabel={strings.common.assignee}
            onChange={(x) => setAssigneeId(x)}
            id="assignee-select"
          >
            <MenuItem key={"assignee-all"} value={"all"}>
              {strings.common.all}
            </MenuItem>
            {users.map((u) => {
              return (
                <MenuItem key={"assignee-" + u.id} value={u.id}>
                  {u.id}
                </MenuItem>
              );
            })}
          </DropDown>
        </Box>
      </Box>
      <Box className="reset-button-box">
        <Button aria-label="reset" data-test="reset-table-view" color="secondary" onClick={handleReset}>
          {strings.common.reset}
        </Button>
        {/* TODO Add Search Button after implementing pagination from API */}
        {/* <Button aria-label="search" data-test="search" color="primary" onClick={handleSearch}>
          {strings.common.search}
        </Button> */}
      </Box>
    </Box>
  );
};

export default FilterMenu;
