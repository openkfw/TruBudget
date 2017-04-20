import React from 'react';
import { Card, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';


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
        <Divider />
      </div>
    )

    index++;
  }
  return items
}

const LoginPage = ({ users, login }) => {
  return (
    <div style={{
      backgroundImage: 'url("/navbar_back2.jpg")',
      backgroundSize: 'cover',
      width: '100%',
      height: '100%',
      position: 'absolute'
    }}>
      <Card style={{
        width: '40%',
        left: '30%',
        top: '100px',
        position: 'absolute',
        zIndex: 1100,
        opacity: 0.9
      }}>
        <CardMedia
          overlay={<CardTitle title="ACMECorp Blockchain" subtitle="Working together for a better world" />}>
          <img style={{
            marginTop: '10px',
            marginBottom: '90px'
          }}
            alt="Logo"
            src="/do_logo.png" />
        </CardMedia>
        <List>
          <Subheader>Choose your user for login</Subheader>
          {createListItems(users, login)}
        </List>
        <CardText>
          Developed by Emerging Technologies & Innovation @ Accenture
        </CardText>
      </Card>
    </div>
  )
}

export default LoginPage;
