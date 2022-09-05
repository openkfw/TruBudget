import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PasswordIcon from "@mui/icons-material/Lock";
import React from "react";
import strings from "../../localizeStrings";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";

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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibilty = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
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
          helperText={failed ? failedText : null}
          type={isPasswordVisible ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton id="showPasswordButton" onClick={togglePasswordVisibilty}>
                  {!isPasswordVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          {...props}
        />
      </Tooltip>
    </div>
  );
};

export default Password;
