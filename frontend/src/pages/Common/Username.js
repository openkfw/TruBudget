import React from "react";

import strings from "../../localizeStrings";

import TextInputWithIcon from "./TextInputWithIcon";

const Username = ({ username, storeUsername, failed, id, failedText, label, icon, ...props }) => {
  return (
    <TextInputWithIcon
      style={{ width: "70%" }}
      label={label || strings.common.username}
      value={username}
      margin="normal"
      error={failed}
      id={id}
      icon={icon}
      onChange={(event) => storeUsername(event.target.value)}
      helperText={failed ? failedText : null}
      {...props}
    />
  );
};
export default Username;
