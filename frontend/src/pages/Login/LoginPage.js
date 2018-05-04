import React from "react";
import { Card, CardTitle, CardText } from "material-ui/Card";
import Divider from "material-ui/Divider";
import { ACMECorpLightgreen } from "../../colors";
import SettingsIcon from "material-ui/svg-icons/action/settings";
import IconButton from "material-ui/IconButton";
import RaisedButton from "material-ui/RaisedButton";
import SelectField from "material-ui/SelectField";
import MenuItem from "material-ui/MenuItem";
import DropDownMenu from "material-ui/DropDownMenu";

import Username from "../Common/Username";
import Password from "../Common/Password";
import strings from "../../localizeStrings";
//import { isAdminNode } from '../../helper';

const LoginPage = ({
  history,
  nodePermissions,
  storeUsername,
  storePassword,
  username,
  password,
  loginWithCredentails,
  loginUnsuccessful,
  environment,
  storeEnvironment,
  language,
  setLanguage
}) => {
  //const connectedToAdminNode = isAdminNode(nodePermissions);
  const connectedToAdminNode = -1;
  return (
    <div
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
          <CardTitle title="TruBudget" subtitle={strings.login.tru_budget_description} />
          <SelectField
            onChange={(event, index, value) => storeEnvironment(value)}
            floatingLabelText={strings.login.environment}
            value={environment}
            floatingLabelStyle={{ color: ACMECorpLightgreen }}
            style={{ width: "40%", marginRight: "8px" }}
          >
            <MenuItem value="Test" primaryText={strings.login.test_env} />
            <MenuItem value="Prod" primaryText={strings.login.production_env} />
          </SelectField>
        </div>
        <Divider />
        <Username username={username} storeUsername={storeUsername} loginFailed={loginUnsuccessful} />
        <Password
          password={password}
          storePassword={storePassword}
          loginFailed={loginUnsuccessful}
          nextBestAction={() => loginWithCredentails(username, password)}
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
          <DropDownMenu
            style={{ marginLeft: 5 }}
            value={language}
            onChange={(event, index, value) => setLanguage(value)}
          >
            <MenuItem value="en-gb" primaryText={strings.language.english} />
            <MenuItem value="fr" primaryText={strings.language.french} />
            <MenuItem value="pt" primaryText={strings.language.portuguese} />
            <MenuItem value="de" primaryText={strings.language.german} />
          </DropDownMenu>
          <RaisedButton
            label={strings.login.login_button_title}
            aria-label="loginbutton"
            style={{ marginRight: 20, marginTop: 5 }}
            onTouchTap={() => loginWithCredentails(username, password)}
          />
        </div>
        <Divider />
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
          <CardText style={{ fontSize: "11px" }}>{strings.login.accenture_tag}</CardText>
          <IconButton disabled={!(connectedToAdminNode > -1)} onClick={() => history.push("/admin")}>
            <SettingsIcon />
          </IconButton>
        </div>
      </Card>
      <img style={{ marginTop: "40px", width: "200px" }} alt="Logo" src="/do_logo.png" />
    </div>
  );
};

export default LoginPage;
