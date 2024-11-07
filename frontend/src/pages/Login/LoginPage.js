import React from "react";
import { Link, useNavigate } from "react-router-dom";

import SettingsIcon from "@mui/icons-material/Settings";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import MenuItem from "@mui/material/MenuItem";

import config from "../../config";
import strings from "../../localizeStrings";
import Dropdown from "../Common/NewDropdown";
import Password from "../Common/Password";
import Username from "../Common/Username";

import "./LoginPage.scss";

const LoginPage = ({
  language,
  loading,
  loginError,
  loginWithCredentials,
  password,
  setLanguage,
  storePassword,
  storeUsername,
  username
}) => {
  const navigate = useNavigate();
  const connectedToAdminNode = -1;
  const isLoginDisabled = username === "" || password === "";
  const isAuthProxyEnabled = window?.injectedEnv?.REACT_APP_AUTHPROXY_ENABLED === "true" || config.authProxy.enabled;
  const authProxyUri = window?.injectedEnv?.REACT_APP_AUTHPROXY_URL || config.authProxy.url;

  return (
    <div data-test="loginpage" id="loginpage" className="login-page-container">
      <div className="login-page-content">
        <img src="/Left-side-login.png" alt="Left-side-login" className="login-image" />
        <Card className="login-card" sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, boxShadow: "none" }}>
          <div className="login-card-content">
            <div className="login-card-header">
              <div className="card-header-content">
                <img
                  className="trubudget-logo"
                  src="/Trubudget-logo.png"
                  alt="trubudget-logo"
                  width="142px"
                  height="28.5px"
                />
                <Typography>{strings.login.frontend_description}</Typography>
              </div>
            </div>
          </div>
          <Divider className="divider-with-margin" />
          <Box sx={{ width: "100%" }}>
            <Grid sx={{ display: "flex", flexDirection: "column" }} container>
              <Username username={username} storeUsername={storeUsername} failed={loginError} id="username" />
              <Password
                className="password login"
                password={password}
                iconDisplayed={false}
                storePassword={storePassword}
                setPassword={storePassword}
                label={strings.common.password}
                failed={loginError}
                nextBestAction={() => loginWithCredentials(username, password)}
                id="password"
                data-test="password-field"
              />
              <Box className="forgot-password">
                <Button component={Link} to="/forgot-password" variant="text" size="small">
                  {strings.forgotPassword.link}
                </Button>
              </Box>
              <div className="login-card-footer">
                <Button
                  className="login-button"
                  disabled={isLoginDisabled}
                  aria-label="loginbutton"
                  onClick={() => loginWithCredentials(username, password)}
                  variant="contained"
                  id="loginbutton"
                >
                  {strings.login.login_button_title}
                </Button>
              </div>
            </Grid>
          </Box>
          <Divider className="divider-with-margin" />
          {isAuthProxyEnabled && (
            <>
              <div className="login-button-proxy-container">
                <Button
                  aria-label="loginbutton"
                  onClick={() => window.open(authProxyUri, "_self")}
                  variant="contained"
                  id="orgaloginbutton"
                  className="login-button"
                >
                  {strings.login.login_authproxy_button_title}
                </Button>
              </div>
              <Divider className="divider-with-margin" />
            </>
          )}
          <Box>{loading && <LinearProgress />}</Box>
          <div className="admin-login-settings">
            <Dropdown value={language} id="language_selection" onChange={setLanguage} className="login-dropdown">
              <MenuItem value="en-gb">{strings.language.english}</MenuItem>
              <MenuItem value="fr">{strings.language.french}</MenuItem>
              <MenuItem value="pt">{strings.language.portuguese}</MenuItem>
              <MenuItem value="de">{strings.language.german}</MenuItem>
              <MenuItem value="ka">{strings.language.georgian}</MenuItem>
            </Dropdown>
            <IconButton
              aria-label="admin settings"
              disabled={!(connectedToAdminNode > -1)}
              onClick={() => navigate("/admin")}
              size="large"
            >
              <SettingsIcon />
            </IconButton>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
