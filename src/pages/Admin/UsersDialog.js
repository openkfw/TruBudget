import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import AutoComplete from 'material-ui/AutoComplete';
import _ from 'lodash';
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
    },
    dropDownLabel: {
        paddingLeft: '0px'
    },
    dropDownUnderline: {
        marginLeft: '0px'
    },
}


const isInputValid = (username, fullName, password, role, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, existingRoles) => {
    const roleExist = existingRoles.find((existingRole => existingRole.role === role.toLowerCase()));
    let inputValid = true;
    if (_.isEmpty(username)) {
        isUsernameError(true);
        inputValid = false;
    }
    if (_.isEmpty(fullName)) {
        isFullNameError(true);
        inputValid = false;
    }
    if (_.isEmpty(password)) {
        isPasswordError(true);
        inputValid = false;
    }
    if (_.isEmpty(role) || !roleExist) {
        isRoleNotFoundError(true);
        inputValid = false;
    }
    return inputValid;


}
const handleSubmit = (hideUsersDialog, addUser, userToAdd, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, roles, storeSnackBarMessage, openSnackBar) => {
    const username = userToAdd.getIn(['username']);
    const fullName = userToAdd.getIn(['fullName']);
    const password = userToAdd.getIn(['password']);
    const avatar = userToAdd.getIn(['avatar']);
    const role = userToAdd.getIn(['role']);
    const inputValid = isInputValid(username, fullName, password, role, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, roles);
    if (inputValid) {
        addUser(username, fullName, avatar, password, role);
        storeSnackBarMessage('Added ' + fullName)
        openSnackBar();
        hideUsersDialog();
    }
}

const getDialogActions = (hideUsersDialog, addUser, userToAdd, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, roles, storeSnackBarMessage, openSnackBar) => {

    const cancelButton = <FlatButton label={ strings.common.cancel } primary={ true } onTouchTap={ () => hideUsersDialog() } />
    const submitButton = <FlatButton label={ strings.common.submit } primary={ true } onTouchTap={ () => handleSubmit(hideUsersDialog, addUser, userToAdd, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, roles, storeSnackBarMessage, openSnackBar) } />
    const actions = <div style={ styles.actions }>
                      { cancelButton }
                      { submitButton }
                    </div>
    return actions;
}

const dataSourceConfig = {
    text: 'role',
    value: 'role',
};


const autoCompleteUpdateInput = (text, setUserRole) => {
    setUserRole(text);
}

const autoCompleteOnSelect = (selectedRole, setUserRole) => {
    if (_.isEmpty(selectedRole.role)) {
        setUserRole(selectedRole);
    } else {
        setUserRole(selectedRole.role)
    }
}


const UsersDialog = (props) => {

    const {showUsernameError, showFullNameError, showPasswordError, showRoleNotFoundError, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, usersDialogShown, addUser, userToAdd, roles, hideUsersDialog, setUsername, setUserFullName, setUserPassword, setUserAvatar, setUserRole, storeSnackBarMessage, openSnackBar} = props;

    const actions = getDialogActions(hideUsersDialog, addUser, userToAdd, isUsernameError, isFullNameError, isPasswordError, isRoleNotFoundError, roles, storeSnackBarMessage, openSnackBar)
    const username = userToAdd.getIn(['username']);
    const fullName = userToAdd.getIn(['fullName']);
    const password = userToAdd.getIn(['password']);
    const avatar = userToAdd.getIn(['avatar']);
    const role = userToAdd.getIn(['role']);

    return (
        <Dialog title={ strings.adminDashboard.new_user } actions={ actions } modal={ false } open={ usersDialogShown } onRequestClose={ () => hideUsersDialog() }>
          <div style={ styles.container }>
            <div style={ styles.textFieldDiv }>
              <TextField errorText={ showUsernameError ? strings.adminDashboard.incorrect_full_name : "" } floatingLabelText={ strings.adminDashboard.full_name } value={ fullName } onChange={ (event) => setUserFullName(event.target.value) } />
              <TextField errorText={ showFullNameError ? strings.common.incorrect_username : "" } floatingLabelText={ strings.common.username } value={ username } onChange={ (event) => setUsername(event.target.value) } />
              <TextField errorText={ showPasswordError ? strings.common.incorrect_password : "" } floatingLabelText={ strings.common.password } type="password" value={ password } onChange={ (event) => setUserPassword(event.target.value) } />
            </div>
            <div style={ styles.textFieldDiv }>
              <DropDownMenu labelStyle={ styles.dropDownLabel } underlineStyle={ styles.dropDownUnderline } value={ avatar } onChange={ (event, index, value) => setUserAvatar(value) }>
                <MenuItem value={ '/lego_avatar_male1.jpg' } primaryText="lego_avatar_male1" />
                <MenuItem value={ '/lego_avatar_female2.jpg' } primaryText="lego_avatar_female2" />
                <MenuItem value={ '/lego_avatar_male3.jpg' } primaryText="lego_avatar_male3" />
                <MenuItem value={ '/lego_avatar_female4.jpg' } primaryText="lego_avatar_female4" />
                <MenuItem value={ '/lego_avatar_male5.jpg' } primaryText="lego_avatar_male5" />
                <MenuItem value={ '/lego_avatar_female6.jpg' } primaryText="lego_avatar_female6" />
              </DropDownMenu>
              <AutoComplete onUpdateInput={ (text) => autoCompleteUpdateInput(text, setUserRole) } errorText={ showRoleNotFoundError ? strings.adminDashboard.role_not_exist_error : "" } floatingLabelText={ strings.project.project_authority_organization_search } searchText={ role } dataSource={ roles }
                dataSourceConfig={ dataSourceConfig } filter={ AutoComplete.fuzzyFilter } menuCloseDelay={ 0 } onNewRequest={ (selectedRole, index) => autoCompleteOnSelect(selectedRole, setUserRole) } />
            </div>
          </div>
        </Dialog>
    )
}
export default UsersDialog;