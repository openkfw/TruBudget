import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PasswordIcon from "@mui/icons-material/Lock";
import React from "react";
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
  tooltipTitle,
  ...props
}) => {
  return (
    <div style={styles.container}>
      {iconDisplayed ? <PasswordIcon style={styles.icon} /> : null}
      <Tooltip title={tooltipTitle ? tooltipTitle : ""} placement="right">
        <TextField
          data-test={props["data-test"] || "password-textfield"}
          style={{ width: "50%" }}
          variant="standard"
          label={label || strings.common.password}
          value={password}
          margin="normal"
          error={failed}
          id={id}
          onBlur={event => (storePassword ? storePassword(event.target.value) : null)}
          onChange={event => (setPassword ? setPassword(event.target.value) : null)}
          onKeyPress={e => handleEnter(e, nextBestAction)}
          type="password"
          helperText={failed ? failedText : null}
          {...props}
        />
      </Tooltip>
    </div>
  );
};

export default Password;
