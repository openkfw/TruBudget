import { MenuItem } from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";
import strings from "../../../localizeStrings";
import DatePicker from "../../Common/DatePicker";
import Dropdown from "../../Common/NewDropdown";
import useHistoryState from "./historyHook";

const styles = {
  searchActions: {
    marginTop: "24px"
  },

  formControl: {
    marginTop: "24px",
    width: "-webkit-fill-available"
  },

  datepicker: {
    padding: "5px",
    marginLeft: "19px",
    minWidth: 200,
    display: "flex",
    flexDirection: "row"
  },
  dropdown: { minWidth: 200, marginRight: "16px" }
};

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

  const getMenuItems = items => {
    return items.map(item => {
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
        id="filter-startat"
        style={styles.datepicker}
        label={strings.history.start_date}
        name="startAt"
        datetime={startAt}
        onChange={onChange}
        onDelete={onDeleteStartAt}
      />
      <DatePicker
        id="filter-endat"
        style={styles.datepicker}
        label={strings.history.end_date}
        name="endAt"
        datetime={endAt}
        onChange={onChange}
        onDelete={onDeleteEndAt}
      />

      <Dropdown
        style={styles.dropdown}
        value={publisher}
        floatingLabel={strings.history.publisher}
        onChange={value => mergeState({ publisher: value })}
        id="filter-publisher"
        disabled={false}
      >
        {getMenuItems(users)}
      </Dropdown>

      <Dropdown
        style={styles.dropdown}
        value={eventType}
        floatingLabel={strings.history.event_type}
        onChange={value => mergeState({ eventType: value })}
        id="filter-eventtype"
        disabled={false}
      >
        {getMenuItems(eventTypes)}
      </Dropdown>

      <div style={styles.searchActions}>
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
