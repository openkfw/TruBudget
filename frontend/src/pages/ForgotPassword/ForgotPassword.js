import React from "react";
import { Link } from "react-router-dom";

import EmailIcon from "@mui/icons-material/Email";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import LinearProgress from "@mui/material/LinearProgress";

import { isEmailAddressValid } from "../../helper";
import strings from "../../localizeStrings";
import TextInputWithIcon from "../Common/TextInputWithIcon";

import "./ForgotPassword.scss";

const ForgotPassword = ({
  loading,
  emailServiceAvailable,
  storeEmail,
  email,
  sendForgotPasswordEmail,
  setValidEmailAddressInput,
  isEmailAddressInputValid
}) => {
  return (
    <div data-test="loginpage" id="loginpage" className="forgot-password-page-container">
      <Card className="forgot-password-card">
        <div className="forgot-password-card-content">
          <div className="forgot-password-card-header">
            <CardHeader
              title={strings.login.frontend_name}
              subheader="Please enter your email in order to receive an e-mail with further instructions."
            />
          </div>
        </div>
        <Divider />
        <Box sx={{ width: "100%" }}>
          <Grid container>
            <Grid item xs>
              {isEmailAddressInputValid ? (
                <TextInputWithIcon
                  value={email}
                  onChange={(event) => storeEmail(event.target.value)}
                  label={strings.common.email}
                  icon={<EmailIcon />}
                  id="email"
                  sx={{ width: "50%" }}
                  type="email"
                />
              ) : (
                <TextInputWithIcon
                  value={email}
                  onChange={(event) => storeEmail(event.target.value)}
                  error
                  helperText={strings.userProfile.invalid_email_address}
                  icon={<EmailIcon />}
                  failed={true}
                  id="email"
                  sx={{ width: "50%" }}
                  type="email"
                />
              )}
              <Box className="message-box">
                {!emailServiceAvailable ? (
                  <Alert severity="error">E-mail service is unavailable at this time, please try again later.</Alert>
                ) : null}
              </Box>
              <Box className="forgot-password-card-footer">
                <Button component={Link} to="/login" variant="text">
                  back to login
                </Button>
                <Button
                  aria-label="forgotPasswordButton"
                  disabled={!emailServiceAvailable}
                  onClick={() => {
                    if (isEmailAddressValid(email)) {
                      const url = window.location.href.substring(0, window.location.href.lastIndexOf("/"));
                      setValidEmailAddressInput(true);
                      sendForgotPasswordEmail(email, url);
                    } else {
                      setValidEmailAddressInput(false);
                    }
                  }}
                  variant="contained"
                  id="forgotPasswordButton"
                >
                  Send email
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

export default ForgotPassword;
