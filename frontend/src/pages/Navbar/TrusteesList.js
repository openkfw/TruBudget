import React from "react";

import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import NotOK from "@material-ui/icons/Close";
import OK from "@material-ui/icons/Check";
import Subheader from "@material-ui/core/ListSubheader";

import _values from "lodash/values";

import { ACMECorpSuperLightgreen, ACMECorpLightgrey, ACMECorpGreen, red, lightRed } from "../../colors";
import strings from "../../localizeStrings";

const styles = {
  chip: {
    margin: "4px"
  },
  label: {
    fontSize: "12px",
    lineHeight: "20px"
  },
  icon: {
    height: "20px",
    width: "20px"
  },
  container: {
    display: "flex",
    flexWrap: "wrap"
  }
};

const createChip = (name, ok) => (
  <Chip style={styles.chip} labelStyle={styles.label} backgroundColor={ok ? ACMECorpSuperLightgreen : lightRed}>
    <Avatar
      style={styles.icon}
      backgroundColor={ACMECorpLightgrey}
      color={ok ? ACMECorpGreen : red}
      icon={ok ? <OK /> : <NotOK />}
    />
    {name}
  </Chip>
);

export const getChipList = role => (
  <div style={styles.container}>
    {createChip(strings.navigation.read_permission, role.read)}
    {createChip(strings.navigation.write_permission, role.write)}
    {createChip(strings.navigation.admin_permission, role.admin)}
  </div>
);

const getRoleDescription = ({ role }) => {
  return <ListItem key="role">{getChipList(role)}</ListItem>;
};

const createListItems = users =>
  users.map((user, index) => {
    return (
      <ListItem
        key={index}
        primaryText={user.name}
        secondaryText={user.organization}
        leftAvatar={<Avatar src={user.avatar} />}
        nestedItems={[getRoleDescription(user)]}
      />
    );
  });

const TrusteesList = ({ users, loggedInUser }) => {
  const otherUsers = _values(users).filter(user => user.id !== loggedInUser.id);
  return (
    <List>
      <Subheader>{strings.navigation.other_trustees}</Subheader>
      {createListItems(otherUsers)}
    </List>
  );
};

export default TrusteesList;
