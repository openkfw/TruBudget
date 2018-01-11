import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import strings from '../../localizeStrings';
import UsernameTextField from '../Common/UsernameTextField';
import PasswordTextField from '../Common/PasswordTextField';

const styles = {
    checkbox: {
        marginBottom: 16,
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
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
    customContentStyle: {
        width: '35%',
        maxWidth: 'none',
    },
    errorText: {
        fontSize: '13px',
        color: 'red'
    }
}

const handleSubmit = (hideAdminLogin, login, adminCredentials) => {
    const username = adminCredentials.getIn(['username']);
    const password = adminCredentials.getIn(['password']);
    const user = {
        username,
        password
    };
    login(user);
}
const handleCancel = (hideAdminLogin, history, logout) => {
    hideAdminLogin();
    logout();
    history.push('/login');
}


const getDialogActions = (hideAdminLogin, history, login, adminCredentials, logout) => {
    const cancelButton = <FlatButton label={strings.common.cancel} primary={true} onTouchTap={() => handleCancel(hideAdminLogin, history, logout)} />
    const submitButton = <FlatButton label={strings.login.login_button_title} primary={true} onTouchTap={() => handleSubmit(hideAdminLogin, login, adminCredentials)} />
    const actions = <div style={styles.actions}>
        {cancelButton}
        {submitButton}
    </div>
    return actions;
}

const AdminLoginDialog = (props) => {
    const { adminCredentials, logout, adminLoginFailed, adminLoggedIn, loggedInAdminUser, setAdminUsername, history, hideAdminLogin, setAdminPassword, login } = props;
    const actions = getDialogActions(hideAdminLogin, history, login, adminCredentials, logout)
    const username = adminCredentials.getIn(['username']);
    const password = adminCredentials.getIn(['password']);
    return (
        <Dialog title={strings.adminDashboard.admin_login} modal={true} contentStyle={styles.customContentStyle} actions={actions} open={true}>
            <div style={styles.container}>
                <div style={styles.textFieldDiv}>
                    <UsernameTextField username={username} storeUsername={setAdminUsername} loginFailed={adminLoginFailed} />
                    <PasswordTextField password={password} storePassword={setAdminPassword} loginFailed={adminLoginFailed} />
                    {adminLoggedIn && !loggedInAdminUser.adminUser ? <span style={styles.errorText}> {strings.adminDashboard.user_not_authorized} </span> : ""}
                </div>
            </div>
        </Dialog>
    )
}
export default AdminLoginDialog;