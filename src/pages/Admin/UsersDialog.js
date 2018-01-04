import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import strings from '../../localizeStrings';

const styles = {
    checkbox: {
        marginBottom: 16,
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center'
    },
    textFieldDiv: {
        display: 'flex',
        flexDirection: 'column'
    },
    checkBoxDiv: {
        marginTop: '40px',
        marginRight: '40px'
    },
    actions: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between'
    }

}
const getDialogActions = (hideUsersDialog, addUser, userToAdd) => {

    const cancelButton = <FlatButton label={ strings.common.cancel } primary={ true } onTouchTap={ () => hideUsersDialog() } />
    const submitButton = <FlatButton label={ strings.common.submit } primary={ true } onTouchTap={ () => handleSubmit(hideUsersDialog, addUser, userToAdd) } />
    const actions = <div style={ styles.actions }>
                      { cancelButton }
                      { submitButton }
                    </div>
    return actions;
}

const handleSubmit = (hideUsersDialog, addUser, userToAdd) => {
    const username = userToAdd.getIn(['username']);
    const fullName = userToAdd.getIn(['fullName']);
    const password = userToAdd.getIn(['password']);
    const avatar = userToAdd.getIn(['avatar']);
    const role = userToAdd.getIn(['role']);
    addUser(username, fullName, avatar, password, role);
    hideUsersDialog();
}


const dataSourceConfig = {
    text: 'role',
    value: 'role',
};


const UsersDialog = (props) => {

    const {usersDialogShown, addUser, userToAdd, roles, hideUsersDialog, setUsername, setUserFullName, setUserPassword, setUserAvatar, setUserRole} = props;
    const actions = getDialogActions(hideUsersDialog, addUser, userToAdd)
    const username = userToAdd.getIn(['username']);
    const fullName = userToAdd.getIn(['fullName']);
    const password = userToAdd.getIn(['password']);
    const avatar = userToAdd.getIn(['avatar']);
    const role = userToAdd.getIn(['role']);

    return (
        <Dialog title="New User" actions={ actions } modal={ false } open={ usersDialogShown } onRequestClose={ () => hideUsersDialog() }>
          <div style={ styles.container }>
            <div style={ styles.textFieldDiv }>
              <TextField floatingLabelText="Full Name" value={ fullName } onChange={ (event) => setUserFullName(event.target.value) } />
              <TextField floatingLabelText="Username" value={ username } onChange={ (event) => setUsername(event.target.value) } />
              <TextField floatingLabelText="Password" type="password" value={ password } onChange={ (event) => setUserPassword(event.target.value) } />
            </div>
            <div style={ styles.textFieldDiv }>
              <DropDownMenu labelStyle={ { paddingLeft: '0px' } } underlineStyle={ { marginLeft: '0px' } } value={ avatar } onChange={ (event, index, value) => setUserAvatar(value) }>
                <MenuItem value={ '/lego_avatar_male1.jpg' } primaryText="lego_avatar_male1" />
                <MenuItem value={ '/lego_avatar_female2.jpg' } primaryText="lego_avatar_female2" />
                <MenuItem value={ '/lego_avatar_male3.jpg' } primaryText="lego_avatar_male3" />
                <MenuItem value={ '/lego_avatar_female4.jpg' } primaryText="lego_avatar_female4" />
                <MenuItem value={ '/lego_avatar_male5.jpg' } primaryText="lego_avatar_male5" />
                <MenuItem value={ '/lego_avatar_female6.jpg' } primaryText="lego_avatar_female6" />
              </DropDownMenu>
              <AutoComplete floatingLabelText={ strings.project.project_authority_organization_search } searchText={ role } dataSource={ roles } dataSourceConfig={ dataSourceConfig } filter={ AutoComplete.fuzzyFilter }
                menuCloseDelay={ 0 } onNewRequest={ (selectedRole, index) => setUserRole(selectedRole.role) } />
            </div>
          </div>
        </Dialog>
    )
}
export default UsersDialog;