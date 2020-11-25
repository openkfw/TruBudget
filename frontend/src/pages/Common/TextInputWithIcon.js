import React from "react";

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
  },
  label: {
    whiteSpace: "nowrap",
    width: "-webkit-fill-available",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
};

const TextInputWithIcon = ({ username, storeUsername, failed, icon, label, id, ...props }) => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <TextField
        id={id}
        label={label}
        InputLabelProps={{
          style: styles.label
        }}
        value={username}
        margin="normal"
        error={failed}
        onChange={event => storeUsername(event.target.value)}
        helperText={failed ? strings.common.incorrect_username : null}
        {...props}
      />
    </div>
  );
};
export default TextInputWithIcon;
