import React from "react";

import PasswordIcon from "@material-ui/icons/Lock";
import TextField from "@material-ui/core/TextField";

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
  }
};

const handleEnter = (e, action = () => {}) => {
  if (e.charCode === 13) {
    action();
  }
};

const Password = ({ password, storePassword, failed, nextBestAction, id, ...props }) => {
  return (
    <div style={styles.container}>
      <PasswordIcon style={styles.icon} />
      <TextField
        data-test="password-textfield"
        style={{ width: "50%" }}
        label={strings.common.password}
        value={password}
        margin="normal"
        error={failed}
        id={id}
        onChange={event => storePassword(event.target.value)}
        onKeyPress={e => handleEnter(e, nextBestAction)}
        type="password"
        helperText={failed ? strings.common.incorrect_password : null}
        {...props}
      />
    </div>
  );
};

export default Password;
