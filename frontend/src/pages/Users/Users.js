import React from "react";
import UserCreate from "./UserCreate";
import UsersTable from "./UsersTable";

const styles = {
  container: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  customWidth: {
    width: "90%"
  }
};
const Users = props => (
  <div id="userdashboard" style={styles.container}>
    <div style={styles.customWidth}>
      <UserCreate {...props} />
      <UsersTable {...props} />
    </div>
  </div>
);

export default Users;
