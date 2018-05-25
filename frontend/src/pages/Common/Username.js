import React from "react";

import TextField from "@material-ui/core/TextField";
import UsernameIcon from "@material-ui/icons/Person";

import { ACMECorpDarkBlue } from "../../colors";
import strings from "../../localizeStrings";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    marginTop: "20px",
    marginRight: "20px"
  },
  floatingLabel: {
    color: ACMECorpDarkBlue
  },
  underlineFocus: {
    borderBottomColor: ACMECorpDarkBlue
  }
};

const Username = ({ username, storeUsername, loginFailed, ...props }) => {
  return (
    <div style={styles.container}>
      <UsernameIcon style={styles.icon} />
      <TextField
        style={{ width: "60%" }}
        label={strings.common.username}
        value={username}
        margin="normal"
        error={loginFailed}
        onChange={event => storeUsername(event.target.value)}
        helperText={loginFailed ? strings.common.incorrect_username : null}
        {...props}
      />
    </div>
  );
};
export default Username;
