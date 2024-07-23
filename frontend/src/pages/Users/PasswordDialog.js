import { useState } from "react";
import React from "react";
import { useEffect } from "react";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";

import { formatString, getPasswordErrorText, validatePassword } from "../../helper";
import strings from "../../localizeStrings";
import Password from "../Common/Password";

import "./PasswordDialog.scss";

const getDialogActions = (submitDisabled, hidePasswordDialog, handleSubmit) => {
  const cancelButton = (
    <Button
      aria-label="cancel"
      data-test="password-change-cancel"
      color="secondary"
      onClick={() => hidePasswordDialog()}
    >
      {strings.common.cancel}
    </Button>
  );
  const submitButton = (
    <Button
      aria-label="submit"
      data-test="password-change-submit"
      color="primary"
      disabled={submitDisabled}
      onClick={() => handleSubmit(handleSubmit)}
    >
      {strings.common.submit}
    </Button>
  );

  const leftAction = <div key="leftactions">{cancelButton}</div>;
  const rightAction = <div key="rightactions">{submitButton}</div>;

  return [leftAction, rightAction];
};

const PasswordDialog = (props) => {
  const {
    passwordDialogShown,
    editId,
    storeSnackbarMessage,
    authenticationFailed,
    checkAndChangeUserPassword,
    hidePasswordDialog,
    isRoot
  } = props;

  const [userPassword, setUserPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");

  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [newPasswordsMatch, setNewPasswordsMatch] = useState(true);

  const [fieldType, setFieldType] = useState("password");

  const toggleFieldType = () => {
    if (fieldType === "password") {
      setFieldType("text");
    } else {
      setFieldType("password");
    }
  };

  useEffect(() => {
    return () => {
      // Clean the state
      setUserPassword("");
      setNewPassword("");
      setNewPasswordConfirmation("");
      setNewPasswordsMatch(true);
      setPasswordInvalid(false);
      setFieldType("password");
    };
  }, [passwordDialogShown]);

  const failedText = getPasswordErrorText(newPasswordsMatch, passwordInvalid);
  const newPasswordFailed = !newPasswordsMatch || passwordInvalid;

  const title = formatString(strings.users.change_password_for, editId);
  const handleSubmit = () => {
    const newPasswordValid = validatePassword(newPassword);
    storeSnackbarMessage(strings.users.password_change_success);
    if (newPassword !== newPasswordConfirmation) {
      setPasswordInvalid(false);
      setNewPasswordsMatch(false);
    } else {
      // Password is valid
      if (!newPasswordValid) {
        setPasswordInvalid(true);
      } else {
        setPasswordInvalid(false);
        setNewPasswordsMatch(true);
        checkAndChangeUserPassword(props.userId, editId, userPassword, newPassword);
      }
    }
  };

  const tooltipTitle = (
    <div>
      {strings.users.password_conditions_preface}
      <ul>
        <li>{strings.users.password_conditions_length}</li>
        <li>{strings.users.password_conditions_letter}</li>
        <li>{strings.users.password_conditions_number}</li>
      </ul>
    </div>
  );

  const submitDisabled =
    (!isRoot && userPassword.length === 0) || newPassword.length === 0 || newPasswordConfirmation.length === 0;

  return (
    <Dialog
      disableRestoreFocus
      className="password-paper-root"
      open={passwordDialogShown}
      maxWidth="md"
      data-test="creation-dialog"
    >
      <DialogTitle>{title}</DialogTitle>
      <div>
        <div>
          {!isRoot ? (
            <Card>
              <CardHeader subheader={formatString(strings.users.type_current_password, props.userId)} />
              <CardContent>
                <Password
                  className="password"
                  iconDisplayed={false}
                  data-test="user-password-textfield"
                  label={strings.users.current_user_password}
                  password={userPassword}
                  setPassword={setUserPassword}
                  failed={authenticationFailed}
                  id="userPassword"
                  failedText={strings.common.incorrect_password}
                />
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader subheader={formatString(strings.users.type_new_password, editId)} />
            <CardContent>
              <Password
                className="password"
                iconDisplayed={false}
                data-test="new-password-textfield"
                label={strings.users.new_user_password}
                password={newPassword}
                failed={newPasswordFailed}
                id="newPassword"
                onChange={(event) => setNewPassword(event.target.value)}
                type={fieldType}
                tooltipTitle={tooltipTitle}
              />
              <Password
                className="password"
                iconDisplayed={false}
                data-test="new-password-confirmation-textfield"
                label={strings.users.new_user_password_confirmation}
                password={newPasswordConfirmation}
                failed={newPasswordFailed}
                id="newPasswordConfirmation"
                onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                type={fieldType}
                failedText={failedText}
              />
              <div className="show-password">
                <Button color="primary" onClick={toggleFieldType}>
                  {(fieldType === "password" ? "Show" : "Hide") + " passwords"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <DialogActions>{getDialogActions(submitDisabled, hidePasswordDialog, handleSubmit)}</DialogActions>
    </Dialog>
  );
};

export default PasswordDialog;
