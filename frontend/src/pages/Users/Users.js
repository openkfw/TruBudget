import React from "react";
import UserStats from "./UserStats";
import UsersTabs from "./UsersTabs";

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
const Users = props => (
  <div style={styles.container}>
    <div style={styles.customWidth}>
      <UserStats {...props} />
      <UsersTabs {...props} />
    </div>
  </div>
);

export default Users;
