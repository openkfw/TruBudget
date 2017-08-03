import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';

const defaultUser = {
  jdoe: {
    id: 'jdoe',
    name: 'John Doe',
    organization: 'Ministry of Finance',
    password: 'test',
    avatar: '/lego_avatar_male1.jpg',
    avatar_back: '/lego_avatar_male1.jpg',
  },
  pkleffmann: {
    id: 'pkleffmann',
    name: 'Piet Kleffmann',
    organization: 'ACMECorp',
    password: 'test',
    avatar: '/lego_avatar_male5.jpg',
    avatar_back: '/lego_avatar_male5.jpg',
  },
}

const createListItems = (users, login) => {
  const items = [];
  if (users.size === 0) return items;
  let index = 0;
  for (const user in users) {
    const data = users[user];

    items.push(
      <div key={index}>
        <ListItem
          leftAvatar={<Avatar src={data.avatar} />}
          primaryText={data.name}
          secondaryText={<span>{data.organization}</span>}
          secondaryTextLines={1}
          onTouchTap={() => login({ ...data, username: user })}
        />
      </div>
    )

    index++;
  }
  return items
}

const LoginPage = ({ users, login }) => {
  return (
    <div style={{
      backgroundImage: 'url("/welcome.jpg")',
      backgroundSize: 'cover',
      width: '100%',
      height: '100%',
      position: 'absolute',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column'
    }}>
      <Card style={{
        width: '350px',
        zIndex: 1100,
        opacity: 0.9
      }}>
        <CardTitle title="TruBudget" subtitle="A blockchain-based solution for budget expenditure" />
        <Divider />
        <List>
          <Subheader>Choose your user to login</Subheader>
          {createListItems(defaultUser, login)}
        </List>
        <Divider />
        <CardText style={{ fontSize: '11px' }}>
          Developed by Emerging Technologies & Innovation @ Accenture
        </CardText>
      </Card>
      <img style={{
        marginTop: '40px',
        width: '200px'
      }}
        alt="Logo"
        src="/do_logo.png" />
    </div>
  )
}

export default LoginPage;
