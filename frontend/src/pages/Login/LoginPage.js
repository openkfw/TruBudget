import React from "react";
import { useNavigate } from "react-router-dom";

import SettingsIcon from "@mui/icons-material/Settings";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
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
      <Card className={isAuthProxyEnabled ? "login-card with-authproxy" : "login-card"}>
        <div className="login-card-content">
          <div className="login-card-header">
            <CardHeader title={strings.login.frontend_name} subheader={strings.login.frontend_description} />
          </div>
        </div>
        <Divider />
        <Box sx={{ width: "100%" }}>
          <Grid container>
            <Grid item xs>
              <Username username={username} storeUsername={storeUsername} failed={loginError} id="username" />
              <Password
                className="password short"
                password={password}
                iconDisplayed={true}
                storePassword={storePassword}
                setPassword={storePassword}
                label={strings.common.password}
                failed={loginError}
                nextBestAction={() => loginWithCredentials(username, password)}
                id="password"
                data-test="password-field"
              />
              <div className="login-card-footer">
                <Dropdown value={language} id="language_selection" onChange={setLanguage} className="login-dropdown">
                  <MenuItem value="en-gb">{strings.language.english}</MenuItem>
                  <MenuItem value="fr">{strings.language.french}</MenuItem>
                  <MenuItem value="pt">{strings.language.portuguese}</MenuItem>
                  <MenuItem value="de">{strings.language.german}</MenuItem>
                  <MenuItem value="ka">{strings.language.georgian}</MenuItem>
                </Dropdown>
                <Button
                  disabled={isLoginDisabled}
                  aria-label="loginbutton"
                  className="login-button"
                  onClick={() => loginWithCredentials(username, password)}
                  variant="contained"
                  id="loginbutton"
                >
                  {strings.login.login_button_title}
                </Button>
              </div>
            </Grid>
            {isAuthProxyEnabled && (
              <>
                <Divider orientation="vertical" flexItem></Divider>
                <Grid item xs>
                  <div className="login-button-proxy-container">
                    <Button
                      aria-label="loginbutton"
                      className="login-button"
                      onClick={() => window.open(authProxyUri, "_self")}
                      variant="contained"
                      id="orgaloginbutton"
                    >
                      LOGIN WITH AUTH PROXY
                    </Button>
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        <Box>{loading && <LinearProgress />}</Box>
        <Divider />
        <div className="admin-settings">
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
  );
};

export default LoginPage;
