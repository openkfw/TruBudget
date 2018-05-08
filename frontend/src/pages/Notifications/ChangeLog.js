import React from "react";
import _ from "lodash";
import Transition from "react-transition-group/Transition";
import { Card, CardHeader } from "material-ui/Card";
import Button from "material-ui/Button";
import { List, ListItem } from "material-ui/List";
import moment from "moment";
import { ACMECorpLightgreen } from "../../colors.js";
import strings from "../../localizeStrings";
import { statusMapping } from "../../helper";

const getDescription = ({ action, data }) => {
  const templateString = strings.history[action];
  switch (action) {
    case "edit_status": {
      const { workflowName, newData } = data;
      return strings.formatString(templateString, workflowName, statusMapping(newData));
    }
    case "edit_amount": {
      const { workflowName, newData, oldData } = data;
      return strings.formatString(templateString, workflowName, oldData, newData);
    }
    case "edit_amountType": {
      const { workflowName, newData, oldData } = data;
      return strings.formatString(templateString, workflowName, oldData, newData);
    }
    case "edit_comment": {
      const { workflowName, newData } = data;
      return strings.formatString(templateString, workflowName, newData);
    }
    case "edit_workflowName": {
      const { newData, oldData } = data;
      return strings.formatString(templateString, oldData, newData);
    }
    case "created_workflow": {
      const { workflowName } = data.data;
      return strings.formatString(templateString, workflowName);
    }
    case "created_project": {
      return templateString;
    }
    case "created_subproject": {
      const { projectName } = data.data;
      return strings.formatString(templateString, projectName);
    }
    case "sort": {
      const { workflowName, previousName, first } = data.data;
      if (first) {
        const templateString = strings.history["first_sort"];
        return strings.formatString(templateString, workflowName);
      }
      return strings.formatString(templateString, workflowName, previousName);
    }
    case "edit_subproject": {
      const { amount, subProjectName } = data.data;
      return strings.formatString(templateString, subProjectName, amount);
    }
    case "edit_documents": {
      const { workflowName } = data;
      return strings.formatString(templateString, workflowName);
    }
    default:
      break;
  }
};

const getListEntries = (logs, users) => {
  return logs.map((item, index) => {
    const description = getDescription(item);
    return (
      <ListItem
        key={index}
        primaryText={description}
        // leftAvatar={<Avatar src={users[userId].avatar} />}
        secondaryText={item.blocktime ? moment(item.blocktime, "X").fromNow() : "Processing ..."}
      />
    );
  });
};

const getSideBar = (hideHistory, logs, users) => {
  const listEntries = _.isEmpty(logs) ? null : getListEntries(logs, users);
  return (
    <div
      style={{
        flex: "1"
      }}
    >
      <Card
        key={"fsdf"}
        style={{
          width: "300px",
          height: "655px"
        }}
      >
        <CardHeader title={strings.common.history} titleColor="white" style={{ backgroundColor: ACMECorpLightgreen }} />
        <List style={{ overflowX: "auto", height: "550px" }}>{listEntries}</List>
        <div style={{ display: "flex", flex: 1, justifyContent: "flex-end" }}>
          <Button onTouchTap={hideHistory} primary={true}>
            {strings.common.close}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ChangeLog = ({ hideHistory, logs, users, showHistory }) => {
  const transitionStyle = {
    entering: { right: "-300px" },
    entered: { right: "0px" },
    exiting: { right: "0px" },
    exited: { right: "-300px" }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "0px",
        right: "0px",
        zIndex: 2000,
        display: "flex",
        flexDirection: "row",
        height: "100%",
        alignItems: "center",
        flex: 1
      }}
    >
      <Transition in={showHistory} timeout={0}>
        {state => (
          <div
            style={{
              height: "100%",
              position: "absolute",
              right: "-300px",
              top: "0px",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              flex: "1",
              transition: "all 350ms ease-in",
              ...transitionStyle[state]
            }}
          >
            {getSideBar(hideHistory, logs, users)}
          </div>
        )}
      </Transition>
    </div>
  );
};

export default ChangeLog;
