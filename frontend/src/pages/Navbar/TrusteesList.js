import React from 'react';
import Avatar from 'material-ui/Avatar';
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Chip from 'material-ui/Chip';
import NotOK from 'material-ui/svg-icons/navigation/close';
import OK from 'material-ui/svg-icons/navigation/check';
import _ from 'lodash';

import { ACMECorpSuperLightgreen, ACMECorpLightgrey, ACMECorpGreen, red, lightRed } from '../../colors';
import strings from '../../localizeStrings';

const styles = {
  chip: {
    margin: '4px',
  },
  label: {
    fontSize: '12px',
    lineHeight: '20px'
  },
  icon: {
    height: '20px',
    width: '20px',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  }

}

const createChip = (name, ok) => (
  <Chip style={styles.chip} labelStyle={styles.label} backgroundColor={ok ? ACMECorpSuperLightgreen : lightRed}>
    <Avatar style={styles.icon} backgroundColor={ACMECorpLightgrey} color={ok ? ACMECorpGreen : red} icon={ok ? <OK /> : <NotOK />} />
    {name}
  </Chip>
)

export const getChipList = (role) => (
  <div style={styles.container}>
    {createChip(strings.navigation.read_permission, role.read)}
    {createChip(strings.navigation.write_permission, role.write)}
    {createChip(strings.navigation.admin_permission, role.admin)}
  </div>
)

const getRoleDescription = ({ role }) => {
  return (
    <ListItem key='role'>
      {getChipList(role)}
    </ListItem>
  )
}

const createListItems = (users) => users.map((user, index) => {
  return (
    <ListItem
      key={index}
      primaryText={user.name}
      secondaryText={user.organization}
      leftAvatar={<Avatar src={user.avatar} />}
      nestedItems={[getRoleDescription(user)]}
    />
  )
});

const TrusteesList = ({ users, loggedInUser }) => {
  const otherUsers = _.values(users).filter((user) => user.id !== loggedInUser.id);
  return (
    <List>
      <Subheader>{strings.navigation.other_trustees}</Subheader>
      {createListItems(otherUsers)}
    </List>
  )
};


export default TrusteesList;
