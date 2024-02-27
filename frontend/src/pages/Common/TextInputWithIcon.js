import React from "react";

import TextField from "@mui/material/TextField";

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
  label: {
    whiteSpace: "nowrap",
    width: "-webkit-fill-available",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};

const TextInputWithIcon = ({ name, value, onChange, helperText, failed, icon, label, id, ...props }) => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <TextField
        name={name}
        variant="standard"
        id={id}
        label={label}
        InputLabelProps={{
          style: styles.label
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
