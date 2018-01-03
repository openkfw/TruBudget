import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';

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
const getDialogActions = (hideRolesDialog) => {

    const cancelButton = <FlatButton label={ strings.common.cancel } primary={ true } onTouchTap={ () => hideRolesDialog() } />
    const submitButton = <FlatButton label={ strings.common.submit } primary={ true } onTouchTap={ () => hideRolesDialog() } />
    const actions = <div style={ styles.actions }>
                      { cancelButton }
                      { submitButton }
                    </div>
    return actions;
}

const RolesDialog = (props) => {
    const {rolesDialogShown, hideRolesDialog, roleToAdd, setRoleName, setRoleOrganization, setRoleReadPermission, setRoleWritePermission, setRoleAdminPermission} = props;
    const actions = getDialogActions(hideRolesDialog)
    const roleName = roleToAdd.getIn(['name']);
    const roleOrganization = roleToAdd.getIn(['organization']);
    const readSelected = roleToAdd.getIn(['readPermissionSelected']);
    const writeSelected = roleToAdd.getIn(['writePermissionSelected']);
    const adminSelected = roleToAdd.getIn(['adminPermissionSelected']);

    return (
        <Dialog title="New Role " actions={ actions } modal={ false } open={ rolesDialogShown } onRequestClose={ () => hideRolesDialog() }>
          <div style={ styles.container }>
            <div style={ styles.textFieldDiv }>
              <TextField floatingLabelText="Organization Name" value={ roleOrganization } onChange={ (event) => setRoleOrganization(event.target.value) } />
              <TextField floatingLabelText="Role ID" value={ roleName } onChange={ (event) => setRoleName(event.target.value) } />
            </div>
            <div style={ styles.checkBoxDiv }>
              <Checkbox label="Read" style={ styles.checkbox } value={ readSelected } onCheck={ (event, isInputChecked) => setRoleReadPermission(isInputChecked) } />
              <Checkbox label="Write" style={ styles.checkbox } value={ writeSelected } onCheck={ (event, isInputChecked) => setRoleWritePermission(isInputChecked) } />
              <Checkbox label="Admin" style={ styles.checkbox } value={ adminSelected } onCheck={ (event, isInputChecked) => setRoleAdminPermission(isInputChecked) } />
            </div>
          </div>
        </Dialog>
    )
}
export default RolesDialog;