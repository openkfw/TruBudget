import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tab from "@material-ui/core/Tab";
import Tabs from "@material-ui/core/Tabs";
import ApprovedNodesTable from "./ApprovedNodesTable";
import DeclinedNodesTable from "./DeclinedNodesTable";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "100%",
    marginTop: "40px"
  }
};

const renderTab = (tabIndex, props) => {
  switch (tabIndex) {
    case 0:
      return <ApprovedNodesTable {...props} />;
    case 1:
      return <DeclinedNodesTable {...props} />;
    default:
      break;
  }
  return null;
};

const NodesTable = props => {
  const [tabIndex, setTabIndex] = useState(0);
  const { classes } = props;
  return (
    <div data-test="nodesDashboard" className={classes.container}>
      <div className={classes.customWidth}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={(_, value) => setTabIndex(value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={"Approved"} aria-label="approvedNodes" data-test="approved-nodes-tab" />
            <Tab label={"Declined"} aria-label="declinedNodes" data-test="declined-nodes-tab" />
          </Tabs>
        </AppBar>
        {renderTab(tabIndex, props)}
      </div>
    </div>
  );
};
export default withStyles(styles)(NodesTable);
