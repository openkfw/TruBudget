import React from "react";

import UsernameIcon from "@material-ui/icons/Person";

import strings from "../../localizeStrings";
import TextInputWithIcon from "./TextInputWithIcon";

const Username = ({ username, storeUsername, failed, id, ...props }) => {
  return (
    <TextInputWithIcon
      style={{ width: "50%" }}
      label={strings.common.username}
      value={username}
      margin="normal"
      error={failed}
      id={id}
      icon={<UsernameIcon />}
      onChange={event => storeUsername(event.target.value)}
      helperText={failed ? strings.common.incorrect_username : null}
      {...props}
    />
  );
};
export default Username;
