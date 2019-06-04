import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import TextField from "@material-ui/core/TextField";
import React from "react";
import { formatString } from "../../helper";

import strings from "../../localizeStrings";

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

const handleEnter = (e, action = () => {}) => {
  if (e.charCode === 13) {
    action();
  }
};

function UserPasswordChange({
  actingUser,
  userId,
  userPassword,
  newPassword,
  newPasswordConfirmation,
  storeUserPassword,
  storeNewPassword,
  storeNewPasswordConfirmation,
  newPasswordsMatch,
  wrongPasswordGiven,
  handleSubmit
}) {
  return (
    <div>
      <Card style={styles.card}>
        <CardHeader subheader={formatString(strings.users.type_current_password, actingUser)} />
        <CardContent>
          <div style={styles.container}>
            <TextField
              data-test="user-password-textfield"
              style={{ width: "50%" }}
              label={strings.users.current_user_password}
              value={userPassword}
              margin="normal"
              error={wrongPasswordGiven}
              id="userPassword"
              onChange={event => storeUserPassword(event.target.value)}
              type="password"
              helperText={wrongPasswordGiven ? strings.common.incorrect_password : null}
            />
          </div>
        </CardContent>
      </Card>
      <Card style={styles.card}>
        <CardHeader subheader={formatString(strings.users.type_new_password, userId)} />
        <CardContent>
          <div style={styles.container}>
            <TextField
              data-test="new-password-textfield"
              style={{ width: "50%" }}
              label={strings.users.new_user_password}
              value={newPassword}
              margin="normal"
              error={!newPasswordsMatch}
              id="newPassword"
              onChange={event => storeNewPassword(event.target.value)}
              type="password"
            />
          </div>
          <div style={styles.container}>
            <TextField
              data-test="new-password-confirmation-textfield"
              style={{ width: "50%" }}
              label={strings.users.new_user_password_confirmation}
              value={newPasswordConfirmation}
              margin="normal"
              error={!newPasswordsMatch}
              id="newPasswordConfirmation"
              onChange={event => storeNewPasswordConfirmation(event.target.value)}
              type="password"
              helperText={!newPasswordsMatch ? strings.users.no_password_match : null}
              onKeyPress={e => handleEnter(e, handleSubmit)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserPasswordChange;
