import React from "react";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import { makePermissionReadable } from "../../../helper";
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
        secondary={makePermissionReadable(name)}
      />
    </ListItem>
  );
};

const PermissionTable = ({
  permissions,
  userList,
  intentOrder,
  myself,
  disabled,
  addTemporaryPermission,
  removeTemporaryPermission,
  temporaryPermissions
}) => {
  return (
    <div>
      {intentOrder.map((section) => {
        return (
          <Card key={section.name + "section"} className="permission-table" data-test="permission-table">
            <CardHeader subheader={strings.permissions[section.name]} />
            <CardContent>
              <List data-test={`${section.name}-list`}>
                {section.intents
                  .filter((i) => permissions[i] !== undefined)
                  .map((p) =>
                    renderPermission(
                      p,
                      userList,
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
