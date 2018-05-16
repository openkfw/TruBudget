import React from "react";

import PasswordIcon from "@material-ui/icons/Lock";
import TextField from "@material-ui/core/TextField";

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

const handleEnter = (e, action = () => {}) => {
  if (e.charCode === 13) {
    action();
  }
};

const Password = ({ password, storePassword, loginFailed, nextBestAction }) => {
  return (
    <div style={styles.container}>
      <PasswordIcon style={styles.icon} />
      <TextField
        style={{ width: "60%" }}
        label={strings.common.password}
        value={password}
        margin="normal"
        error={loginFailed}
        onChange={event => storePassword(event.target.value)}
        onKeyPress={e => handleEnter(e, nextBestAction)}
        type="password"
        helperText={loginFailed ? strings.common.incorrect_password : null}
      />
    </div>
  );
};

export default Password;
