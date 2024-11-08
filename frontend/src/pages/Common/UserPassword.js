import React from "react";
import { useState } from "react";
import { ErrorMessage } from "formik";

import PasswordIcon from "@mui/icons-material/Lock";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

const handleEnter = (e, action = () => {}) => {
  if (e.charCode === 13) {
    action();
  }
};

const UserPassword = ({
  name,
  value,
  error,
  onChange,
  onBlur,
  label,
  nextBestAction,
  id,
  iconDisplayed,
  tooltipTitle,
  className,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibilty = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  return (
    <div className="password-container">
      {iconDisplayed ? <PasswordIcon className="icon" /> : null}
      <Tooltip title={tooltipTitle ? tooltipTitle : ""} placement="right">
        <TextField
          name={name}
          data-test={props["data-test"] || "password-textfield"}
          className={className}
          variant="standard"
          error={error}
          label={label}
          value={value}
          margin="normal"
          id={id}
          onChange={onChange}
          onBlur={onBlur}
          onKeyUp={(e) => handleEnter(e, nextBestAction)}
          helperText={<ErrorMessage name={name}>{(msg) => <span style={{ color: "red" }}>{msg}</span>}</ErrorMessage>}
          type={isPasswordVisible ? "text" : "password"}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton id="showUserPasswordButton" onClick={togglePasswordVisibilty}>
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

export default UserPassword;
