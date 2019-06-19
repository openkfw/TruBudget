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

const Password = ({
  password,
  setPassword,
  storePassword,
  label,
  failed,
  failedText,
  nextBestAction,
  id,
  iconDisplayed,
  ...props
}) => {
  return (
    <div style={styles.container}>
      {iconDisplayed ? <PasswordIcon style={styles.icon} /> : null}
      <TextField
        data-test={props["data-test"] || "password-textfield"}
        style={{ width: "50%" }}
        label={label}
        value={password}
        margin="normal"
        error={failed}
        id={id}
        onBlur={event => storePassword(event.target.value)}
        onChange={event => (setPassword ? setPassword(event.target.value) : null)}
        onKeyPress={e => handleEnter(e, nextBestAction)}
        type="password"
        helperText={failed ? failedText : null}
        {...props}
      />
    </div>
  );
};

export default Password;
