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
import MenuItem from "@mui/material/MenuItem";

import config from "../../config";
import strings from "../../localizeStrings";
import Dropdown from "../Common/NewDropdown";
import Password from "../Common/Password";
import Username from "../Common/Username";

const LoginPage = ({
  storeUsername,
  storePassword,
  username,
  password,
  loginWithCredentials,
  loginError,
  language,
  setLanguage
}) => {
  const navigate = useNavigate();
  const connectedToAdminNode = -1;
  const isLoginDisabled = username === "" || password === "";
  const isAuthBuddyEnabled = config.authBuddy.enabled;

  return (
    <div
      data-test="loginpage"
      id="loginpage"
      style={{
        backgroundImage: 'url("/welcome.jpg")',
        backgroundSize: "cover",
        width: "100%",
        height: "100vh",
        position: "absolute",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
      }}
    >
      <Card style={{ width: isAuthBuddyEnabled ? "600px" : "350px", zIndex: 1100, opacity: 0.9 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ width: "70%" }}>
            <CardHeader title={strings.login.frontend_name} subheader={strings.login.frontend_description} />
          </div>
        </div>
        <Divider />
        <Box sx={{ width: "100%" }}>
          <Grid container>
            <Grid item xs>
              <Username username={username} storeUsername={storeUsername} failed={loginError} id="username" />
              <Password
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
              <div
                style={{
                  paddingTop: "10px",
                  paddingBottom: "20px",
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  justifyContent: "space-between"
                }}
              >
                <Dropdown
                  value={language}
                  id="language_selection"
                  onChange={setLanguage}
                  style={{ marginLeft: "10px" }}
                >
                  <MenuItem value="en-gb">{strings.language.english}</MenuItem>
                  <MenuItem value="fr">{strings.language.french}</MenuItem>
                  <MenuItem value="pt">{strings.language.portuguese}</MenuItem>
                  <MenuItem value="de">{strings.language.german}</MenuItem>
                  <MenuItem value="ka">{strings.language.georgian}</MenuItem>
                </Dropdown>
                <Button
                  disabled={isLoginDisabled}
                  aria-label="loginbutton"
                  style={{ marginRight: 20, marginTop: 5 }}
                  onClick={() => loginWithCredentials(username, password)}
                  variant="contained"
                  id="loginbutton"
                >
                  {strings.login.login_button_title}
                </Button>
              </div>
            </Grid>
            {isAuthBuddyEnabled && (
              <>
                <Divider orientation="vertical" flexItem></Divider>
                <Grid item xs>
                  <div
                    style={{
                      padding: "20px",
                      display: "flex",
                      flexDirection: "row",
                      width: "100%",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <Button
                      aria-label="loginbutton"
                      style={{ marginRight: 20, marginTop: 5 }}
                      onClick={() => window.open(config.authBuddy.url, "_self")}
                      variant="contained"
                      id="orgaloginbutton"
                    >
                      LOGIN WITH AUTHBUDDY
                    </Button>
                  </div>
                </Grid>
              </>
            )}
          </Grid>
        </Box>
        <Divider />
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", float: "right" }}>
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
