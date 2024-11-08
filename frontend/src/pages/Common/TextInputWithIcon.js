import React from "react";

import TextField from "@mui/material/TextField";

const TextInputWithIcon = ({ name, value, onChange, helperText, failed, icon, label, id, ...props }) => {
  return (
    <div className="text-input-container">
      {icon ? <div className="icon">{icon}</div> : null}
      <TextField
        name={name}
        variant="standard"
        id={id}
        label={label}
        InputLabelProps={{
          className: "label"
        }}
        value={value}
        margin="normal"
        error={failed}
        onChange={onChange}
        helperText={helperText}
        {...props}
      />
    </div>
  );
};
export default TextInputWithIcon;
