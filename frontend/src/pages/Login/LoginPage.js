import React from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import SettingsIcon from "@mui/icons-material/Settings";

import Username from "../Common/Username";
import Password from "../Common/Password";
import strings from "../../localizeStrings";
import Dropdown from "../Common/NewDropdown";

const LoginPage = ({
  history,
  nodePermissions,
  storeUsername,
  storePassword,
  username,
  password,
  loginWithCredentials,
  loginError,
  language,
  setLanguage
}) => {
  const connectedToAdminNode = -1;

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
      <Card style={{ width: "350px", zIndex: 1100, opacity: 0.9 }}>
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
          <Dropdown value={language} id="language_selection" onChange={setLanguage} style={{ marginLeft: "10px" }}>
            <MenuItem value="en-gb">{strings.language.english}</MenuItem>
            <MenuItem value="fr">{strings.language.french}</MenuItem>
            <MenuItem value="pt">{strings.language.portuguese}</MenuItem>
            <MenuItem value="de">{strings.language.german}</MenuItem>
            <MenuItem value="ka">{strings.language.georgian}</MenuItem>
          </Dropdown>
          <Button
            aria-label="loginbutton"
            style={{ marginRight: 20, marginTop: 5 }}
            onClick={() => loginWithCredentials(username, password)}
            variant="contained"
            id="loginbutton"
          >
            {strings.login.login_button_title}
          </Button>
        </div>
        <Divider />
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", float: "right" }}>
          <IconButton
            disabled={!(connectedToAdminNode > -1)}
            onClick={() => history.push("/admin")}
            size="large">
            <SettingsIcon />
          </IconButton>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
