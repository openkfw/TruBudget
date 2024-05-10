import React from "react";

import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";

import strings from "../../../localizeStrings";
import DatePicker from "../../Common/DatePicker";
import Dropdown from "../../Common/NewDropdown";

import useHistoryState from "./historyHook";

import "./index.scss";

const HistorySearch = ({ fetchFirstHistoryEvents, users, eventTypes }) => {
  const [{ startAt, endAt, publisher, eventType }, mergeState, clearState] = useHistoryState();

  const onChange = (selectedDate, name) => {
    mergeState({ [name]: selectedDate });
  };

  const onDeleteStartAt = () => {
    mergeState({ startAt: null });
  };
  const onDeleteEndAt = () => {
    mergeState({ endAt: null });
  };

  const onReset = () => {
    clearState();
    fetchFirstHistoryEvents({});
  };

  const getMenuItems = (items) => {
    return items.map((item) => {
      return (
        <MenuItem key={`${item.displayName}_${item.id}`} value={item.id}>
          {item.displayName}
        </MenuItem>
      );
    });
  };

  return (
    <div>
      <DatePicker
        className="date-picker"
        id="filter-startat"
        label={strings.history.start_date}
        name="startAt"
        datetime={startAt}
        onChange={onChange}
        onDelete={onDeleteStartAt}
      />
      <DatePicker
        className="date-picker"
        id="filter-endat"
        label={strings.history.end_date}
        name="endAt"
        datetime={endAt}
        onChange={onChange}
        onDelete={onDeleteEndAt}
      />

      <Dropdown
        className="history-dropdown"
        value={publisher}
        floatingLabel={strings.history.publisher}
        onChange={(value) => mergeState({ publisher: value })}
        id="filter-publisher"
        disabled={false}
      >
        {getMenuItems(users)}
      </Dropdown>

      <Dropdown
        className="history-dropdown"
        value={eventType}
        floatingLabel={strings.history.event_type}
        onChange={(value) => mergeState({ eventType: value })}
        id="filter-eventtype"
        disabled={false}
      >
        {getMenuItems(eventTypes)}
      </Dropdown>

      <div className="search-actions">
        <Button aria-label="reset" data-test="reset" color="secondary" onClick={onReset}>
          {strings.common.reset}
        </Button>
        <Button
          aria-label="search"
          data-test="search"
          color="primary"
          onClick={() => {
            fetchFirstHistoryEvents({ startAt, endAt, publisher, eventType });
          }}
        >
          {strings.common.search}
        </Button>
      </div>
    </div>
  );
};

export default HistorySearch;
