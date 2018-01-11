import React from 'react';
import TextField from 'material-ui/TextField';
import PasswordIcon from 'material-ui/svg-icons/action/lock';
import { ACMECorpDarkBlue } from '../../colors';
import strings from '../../localizeStrings';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    icon: {
        marginTop: '20px',
        marginRight: '20px'
    },
    floatingLabel: {
        color: ACMECorpDarkBlue
    },
    underlineFocus: {
        borderBottomColor: ACMECorpDarkBlue
    }
}
const PasswordTextField = ({password, storePassword, loginFailed}) => {
    return (
        <div style={ styles.container }>
          <PasswordIcon style={ styles.icon } />
          <TextField floatingLabelStyle={ styles.floatingLabel } underlineFocusStyle={ styles.underlineFocus } floatingLabelText={ strings.common.password } value={ password } onChange={ (event) => storePassword(event.target.value) }
            errorText={ loginFailed ? strings.login.incorrect_password : "" } type="password" />
        </div>
    )
}

export default PasswordTextField;