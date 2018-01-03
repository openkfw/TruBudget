import React from 'react';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import { ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
import TextField from 'material-ui/TextField';
import { ACMECorpDarkBlue, ACMECorpLightgreen } from '../../colors'
import UsernameIcon from 'material-ui/svg-icons/social/person';
import PasswordIcon from 'material-ui/svg-icons/action/lock';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import strings from '../../localizeStrings'

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



const LoginPage = ({ history, connectedToAdminNode, users, login, storeUsername, storePassword, username, password, loginWithCredentails, loginUnsuccessful, environment, storeEnvironment, language, setLanguage }) => {
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
 
      
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <CardTitle title="TruBudget" subtitle={strings.login.tru_budget_description} />
          <SelectField
            onChange={(event, index, value) => storeEnvironment(value)}
            floatingLabelText={strings.login.environment} value={environment}
            floatingLabelStyle={{ color: ACMECorpLightgreen }}
            style={{ width: '40%', marginRight: '8px' }}
          >
            <MenuItem value="Test" primaryText={strings.login.test_env} />
            <MenuItem value="Prod" primaryText={strings.login.production_env} />
          </SelectField>
   

        </div>
        <Divider />
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <UsernameIcon style={{ marginTop: '20px', marginRight: '20px' }} />
          <TextField
            floatingLabelStyle={{ color: ACMECorpDarkBlue }}
            underlineFocusStyle={{ borderBottomColor: ACMECorpDarkBlue }}
            floatingLabelText={strings.login.username}
            value={username}
            errorText={loginUnsuccessful ? strings.login.incorrect_username : ""}
            onChange={(event) => storeUsername(event.target.value)}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <PasswordIcon style={{ marginTop: '20px', marginRight: '20px' }} />
          <TextField
            floatingLabelStyle={{ color: ACMECorpDarkBlue }}
            underlineFocusStyle={{ borderBottomColor: ACMECorpDarkBlue }}
            floatingLabelText={strings.login.password}
            value={password}
            onChange={(event) => storePassword(event.target.value)}
            errorText={loginUnsuccessful ? strings.login.incorrect_password : ""}
            type="password"
          />
        </div>
        <div style={{ paddingTop: '10px', paddingBottom: '20px', display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          <DropDownMenu style={{ marginLeft: 5, }} value={language} onChange={(event, index, value) => setLanguage(value)}>
            <MenuItem value='en-gb' primaryText={strings.language.english} />
            <MenuItem value='fr' primaryText={strings.language.french} />
            <MenuItem value='de' primaryText={strings.language.german} />
          </DropDownMenu>
  
          <RaisedButton label={strings.login.login_button_title} aria-label='loginbutton' style={{ marginRight: 20, marginTop: 5 }} onTouchTap={() => loginWithCredentails(username, password)} />
        </div>
        <Divider />
        <div>
          {createListItems(defaultUser, login)}
        </div>
        <Divider />
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
        <CardText style={{ fontSize: '11px' }}>
          {strings.login.accenture_tag}
        </CardText>
        <IconButton disabled={!connectedToAdminNode}  onClick={() => history.push('/admin')}  >
            <SettingsIcon />
          </IconButton>
          </div>
      </Card>
      <img style={{
        marginTop: '40px',
        width: '200px'
      }}
        alt="Logo"
        src="/do_logo.png" />
    </div >
  )
}

export default LoginPage;
