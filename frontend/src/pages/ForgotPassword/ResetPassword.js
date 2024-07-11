import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";

import { getPasswordErrorText, validatePassword } from "../../helper";
import strings from "../../localizeStrings";
import Password from "../Common/Password";

import "./ForgotPassword.scss";

const ResetPassword = ({ loading, resetUserPassword }) => {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState("");
  const [passwordInvalid, setPasswordInvalid] = useState(false);
  const [newPasswordsMatch, setNewPasswordsMatch] = useState(true);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id");
  const token = searchParams.get("resetToken");

  const passwordErrorText = getPasswordErrorText(newPasswordsMatch, passwordInvalid);
  const newPasswordError = !newPasswordsMatch || passwordInvalid;

  const handleSubmit = () => {
    const newPasswordValid = validatePassword(newPassword);
    if (newPassword !== newPasswordConfirmation) {
      setPasswordInvalid(false);
      setNewPasswordsMatch(false);
    } else {
      if (!newPasswordValid) {
        setPasswordInvalid(true);
      } else {
        setPasswordInvalid(false);
        setNewPasswordsMatch(true);
        resetUserPassword(userId, newPassword, token);
      }
    }
  };

  return (
    <div data-test="loginpage" id="loginpage" className="forgot-password-page-container">
      <Card className="forgot-password-card">
        <div className="forgot-password-card-content">
          <div className="forgot-password-card-header">
            <CardHeader title={strings.login.frontend_name} subheader="Please set your new password." />
          </div>
        </div>
        <Divider />
        <Box sx={{ width: "100%" }}>
          <Grid container>
            <Grid item xs>
              <Password
                className="password short"
                password={newPassword}
                iconDisplayed={true}
                onChange={(event) => setNewPassword(event.target.value)}
                label={strings.users.new_user_password}
                id="password"
                data-test="password-field"
                failed={newPasswordError}
              />
              <Password
                className="password short"
                password={newPasswordConfirmation}
                iconDisplayed={true}
                onChange={(event) => setNewPasswordConfirmation(event.target.value)}
                label={strings.users.new_user_password_confirmation}
                id="confirm-password"
                data-test="confirm-password-field"
                failed={newPasswordError}
                failedText={passwordErrorText}
              />
              <Box className="message-box"></Box>
              <Box className="forgot-password-card-footer">
                <Button component={Link} to="/login" variant="text">
                  back to login
                </Button>
                <Button
                  aria-label="resetPasswordButton"
                  onClick={() => handleSubmit()}
                  variant="contained"
                  id="resetPasswordButton"
                >
                  Set New Password
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Box>{loading && <LinearProgress />}</Box>
        <Divider />
      </Card>
    </div>
  );
};

export default ResetPassword;
