import React from "react";
import UserCreate from "./UserCreate";
import UsersTable from "./UsersTable";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import GroupTable from "../Groups/GroupTable";
import Button from "@material-ui/core/Button";
import NavigationIcon from "@material-ui/icons/Navigation";
import Add from "@material-ui/icons/Add";
import GroupEdit from "../Groups/GroupEdit";
import DialogWrapper from "./DialogWrapper";
import DashboardDialogContainer from "./DashboardDialogContainer";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "90%",
    marginTop: "40px"
  }
};
const Users = props => {
  const { tabIndex, setTabIndex, showDashboardDialog } = props;
  return (
    <div id="userdashboard" style={styles.container}>
      <div style={styles.customWidth}>
        <AppBar position="static" color="default">
          <Tabs
            value={tabIndex}
            onChange={(_, value) => setTabIndex(value)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Users" />
            <Tab label="Groups" />
          </Tabs>
        </AppBar>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            alignItems: "center",
            top: "80px",
            right: "-20px",
            width: "30%",
            height: 20
          }}
        >
          <Button
            onClick={() => { tabIndex === 0 ? showDashboardDialog("addUser") : showDashboardDialog("addGroup") }}
            color="primary"
            style={{ position: "absolute", marginTop: -20 }}
            variant="fab"
            aria-label="Add"
          >
            <Add />
          </Button>
        </div>
        {tabIndex === 0 && <UsersTable {...props} />}
        {tabIndex === 1 && <GroupTable {...props} />}
      </div>
      <DashboardDialogContainer {...props} />
    </div>
  );
};

export default Users;
