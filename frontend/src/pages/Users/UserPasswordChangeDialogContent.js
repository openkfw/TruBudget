import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import React, { useState } from "react";
import { formatString } from "../../helper";

import strings from "../../localizeStrings";
import Password from "../Common/Password";

const styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    marginTop: "14px"
  }
};

function UserPasswordChange({
  actingUser,
  userId,
  storeUserPassword,
  storeNewPassword,
  storeNewPasswordConfirmation,
  newPasswordsMatch,
  wrongPasswordGiven,
  handleSubmit
}) {
  const [userPassword, setUserPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  return (
    <div>
      <Card style={styles.card}>
        <CardHeader subheader={formatString(strings.users.type_current_password, actingUser)} />
        <CardContent>
          <Password
            iconDisplayed={false}
            data-test="user-password-textfield"
            label={strings.users.current_user_password}
            password={userPassword}
            storePassword={storeUserPassword}
            setPassword={setUserPassword}
            failed={wrongPasswordGiven}
            id="userPassword"
            failedText={strings.common.incorrect_password}
          />
        </CardContent>
      </Card>
      <Card style={styles.card}>
        <CardHeader subheader={formatString(strings.users.type_new_password, userId)} />
        <CardContent>
          <Password
            iconDisplayed={false}
            data-test="new-password-textfield"
            label={strings.users.new_user_password}
            password={newPassword}
            failed={!newPasswordsMatch}
            id="newPassword"
            onChange={event => setNewPassword(event.target.value)}
            onBlur={event => storeNewPassword(event.target.value)}
            type="password"
          />
          <Password
            iconDisplayed={false}
            data-test="new-password-confirmation-textfield"
            label={strings.users.new_user_password_confirmation}
            password={newPasswordConfirmation}
            failed={!newPasswordsMatch}
            id="newPasswordConfirmation"
            onChange={event => setNewPasswordConfirmation(event.target.value)}
            onBlur={event => storeNewPasswordConfirmation(event.target.value)}
            type="password"
            failedText={!newPasswordsMatch ? strings.users.no_password_match : null}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default UserPasswordChange;
