import React from "react";
import dayjs from "dayjs";

import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";

import strings from "../../../localizeStrings";

import stringifyHistoryEvent from "./stringifyHistoryEvent";

const getEvents = (events, getUserDisplayname) => {
  return events.map((event, index) => {
    if (!(event.businessEvent && event.snapshot)) {
      // eslint-disable-next-line no-console
      console.warn("The event does not have a business event or snapshot and will not be displayed", event);

      return null;
    }
    const eventTime = event.businessEvent.time;
    return (
      <ListItem key={`${index}-${eventTime}`} className="history-item">
        <ListItemAvatar>
          <Avatar alt={"test"} src="/lego_avatar_female2.jpg" />
        </ListItemAvatar>
        <ListItemText
          data-test={`history-item-${index}`}
          primary={stringifyHistoryEvent(event.businessEvent, event.snapshot, getUserDisplayname)}
          secondary={dayjs(eventTime).format(strings.format.dateFormat)}
        />
      </ListItem>
    );
  });
};

const HistoryList = ({ events, nEventsTotal, hasMore, getUserDisplayname, isLoading, historyType }) => {
  const [eventItems, setEventItems] = React.useState([]);

  React.useEffect(() => {
    setEventItems(getEvents(events, getUserDisplayname));
  }, [events, getUserDisplayname]);

  return (
    <List
      className="history-list"
      data-test="history-list"
      subheader={<ListSubheader disableSticky>{historyType}</ListSubheader>}
    >
      {!isLoading && nEventsTotal === 0 ? (
        <ListItem key="no-element">
          <Avatar alt={""} src="" />
          <ListItemText primary="" secondary={strings.common.no_history} />
        </ListItem>
      ) : (
        <div>
          {eventItems}
          {hasMore || isLoading ? null : (
            <ListItem key="closing-element">
              <ListItemAvatar>
                <Avatar alt={""} src="" />
              </ListItemAvatar>
              <ListItemText primary="" secondary={strings.common.history_end} />
            </ListItem>
          )}
        </div>
      )}
    </List>
  );
};

export default HistoryList;
