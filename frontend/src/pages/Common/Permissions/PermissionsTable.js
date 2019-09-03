import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardHeader from "@material-ui/core/CardHeader";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import React from "react";

import strings from "../../../localizeStrings";
import PermissionSelection from "./PermissionSelection";

const renderPermission = (name, userList, permissions, myself, grant, revoke, disabled) => {
  return (
    <ListItem key={name + "perm"}>
      <ListItemText
        primary={
          <PermissionSelection
            name={name}
            userList={userList}
            permissions={permissions}
            grant={grant}
            revoke={revoke}
            myself={myself}
            disabled={disabled}
          />
        }
        secondary={strings.permissions[name.replace(/[.]/g, "_")] || name}
      />
    </ListItem>
  );
};

const PermissionTable = ({
  permissions,
  user,
  id,
  intentOrder,
  myself,
  disabled,
  addTemporaryPermission,
  removeTemporaryPermission,
  temporaryPermissions
}) => {
  return (
    <div>
      {intentOrder.map(section => {
        return (
          <Card key={section.name + "section"} style={{ marginTop: "12px", marginBottom: "12px" }}>
            <CardHeader subheader={strings.permissions[section.name]} />
            <CardContent>
              <List>
                {section.intents
                  .filter(i => permissions[i] !== undefined)
                  .map(p =>
                    renderPermission(
                      p,
                      user,
                      temporaryPermissions,
                      myself,
                      addTemporaryPermission,
                      removeTemporaryPermission,
                      disabled
                    )
                  )}
              </List>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PermissionTable;
