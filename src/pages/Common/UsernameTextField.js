import React from 'react';
import TextField from 'material-ui/TextField';
import UsernameIcon from 'material-ui/svg-icons/social/person';
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

const UsernameTextField = ({username, storeUsername, loginFailed}) => {
    return (
        <div style={ styles.container }>
          <UsernameIcon style={ styles.icon } />
          <TextField floatingLabelStyle={ styles.floatingLabel } underlineFocusStyle={ styles.underlineFocus } floatingLabelText={ strings.login.username } value={ username } errorText={ loginFailed ? strings.login.incorrect_username : "" }
            onChange={ (event) => storeUsername(event.target.value) } />
        </div>
    )
}
export default UsernameTextField;