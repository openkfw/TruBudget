import React from "react";
import UserManagementDetails from "./UserManagementDetails";
import UserManagementTabs from "./UserManagementTabs";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "85%"
  }
};
const UserManagement = props => (
  <div style={styles.container}>
    <div style={styles.customWidth}>
      <UserManagementDetails {...props} />
      <UserManagementTabs {...props} />
    </div>
  </div>
);

export default UserManagement;
