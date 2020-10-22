import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListSubheader from "@material-ui/core/ListSubheader";
import { withStyles } from "@material-ui/core/styles";
import dayjs from "dayjs";
import React from "react";
import { dateFormat } from "../../../helper";
import strings from "../../../localizeStrings";
import stringifyHistoryEvent from "./stringifyHistoryEvent";

const styles = {
  list: {
    maxWidth: "350px",
    minWidth: "350px"
  }
};

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
          secondary={dayjs(eventTime).format(dateFormat())}
        />
      </ListItem>
    );
  });
};

const HistoryList = ({ classes, events, nEventsTotal, hasMore, getUserDisplayname, isLoading }) => {
  const [eventItems, setEventItems] = React.useState([]);

  React.useEffect(() => {
    setEventItems(getEvents(events, getUserDisplayname));
  }, [events, getUserDisplayname]);

  return (
    <List
      data-test="history-list"
      subheader={<ListSubheader disableSticky>{strings.common.history}</ListSubheader>}
      className={classes.list}
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

export default withStyles(styles)(HistoryList);
