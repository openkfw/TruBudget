import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Checkbox from 'material-ui/Checkbox';
import strings from '../../localizeStrings';
import { ACMECorpDarkBlue } from '../../colors';
import UsernameTextField from '../Common/UsernameTextField';
import PasswordTextField from '../Common/PasswordTextField';
import { setAdminUsername } from './actions';

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
    }
}

const handleSubmit = (hideAdminLogin, loginAdminUser, adminCredentials) => {
    const username = adminCredentials.getIn(['username']);
    const password = adminCredentials.getIn(['password']);
    loginAdminUser(username, password);
}

const getDialogActions = (hideAdminLogin, history, loginAdminUser, adminCredentials) => {
    const cancelButton = <FlatButton label={ strings.common.cancel } primary={ true } onTouchTap={ () => history.push('/') } />
    const submitButton = <FlatButton label={ strings.login.login_button_title } primary={ true } onTouchTap={ () => handleSubmit(hideAdminLogin, loginAdminUser, adminCredentials) } />
    const actions = <div style={ styles.actions }>
                      { cancelButton }
                      { submitButton }
                    </div>
    return actions;
}

const AdminLoginDialog = (props) => {
    const {adminCredentials, adminLoginFailed, setAdminUsername, history, hideAdminLogin, setAdminPassword, loginAdminUser} = props;
    const actions = getDialogActions(hideAdminLogin, history, loginAdminUser, adminCredentials)
    const username = adminCredentials.getIn(['username']);
    const password = adminCredentials.getIn(['password']);

    return (
        <Dialog title="Admin Login " modal={ true } contentStyle={ styles.customContentStyle } actions={ actions } modal={ false } open={ true }>
          <div style={ styles.container }>
            <div style={ styles.textFieldDiv }>
              <UsernameTextField username={ username } storeUsername={ setAdminUsername } loginFailed={ adminLoginFailed } />
              <PasswordTextField password={ password } storePassword={ setAdminPassword } loginFailed={ adminLoginFailed } />
            </div>
          </div>
        </Dialog>
    )
}
export default AdminLoginDialog;