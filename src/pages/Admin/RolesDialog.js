import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
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
    }

}

const isInputValid = (roleName, roleOrganization, isRoleNameError, isOrganizationError) => {
    let inputValid = true;
    if (_.isEmpty(roleName)) {
        isRoleNameError(true);
        inputValid = false;
    }

    if (_.isEmpty(roleOrganization)) {
        isOrganizationError(true);
        inputValid = false;
    }
    return inputValid;
}
const handleSubmit = (hideRolesDialog, roleToAdd, addRole, isRoleNameError, isOrganizationError, storeSnackBarMessage, openSnackBar) => {
    const roleName = roleToAdd.getIn(['name']);
    const roleOrganization = roleToAdd.getIn(['organization']);
    const readSelected = roleToAdd.getIn(['readPermissionSelected']);
    const writeSelected = roleToAdd.getIn(['writePermissionSelected']);
    const adminSelected = roleToAdd.getIn(['adminPermissionSelected']);
    const inputValid = isInputValid(roleName, roleOrganization, isRoleNameError, isOrganizationError);
    if (inputValid) {
        addRole(roleName, roleOrganization, readSelected, writeSelected, adminSelected)
        storeSnackBarMessage('Added ' + roleName)
        openSnackBar();
        hideRolesDialog();
    }
}

const getDialogActions = (hideRolesDialog, roleToAdd, addRole, isRoleNameError, isOrganizationError, storeSnackBarMessage, openSnackBar) => {

    const cancelButton = <FlatButton label={strings.common.cancel} primary={true} onTouchTap={() => hideRolesDialog()} />
    const submitButton = <FlatButton label={strings.common.submit} primary={true} onTouchTap={() => handleSubmit(hideRolesDialog, roleToAdd, addRole, isRoleNameError, isOrganizationError, storeSnackBarMessage, openSnackBar)} />
    const actions = <div style={styles.actions}>
        {cancelButton}
        {submitButton}
    </div>
    return actions;
}

const RolesDialog = (props) => {
    const { rolesDialogShown, isRoleNameError, showRoleNameError, showOrganizationError, isOrganizationError, hideRolesDialog, addRole, roleToAdd, setRoleName, setRoleOrganization, setRoleReadPermission, setRoleWritePermission, setRoleAdminPermission, storeSnackBarMessage, openSnackBar } = props;
    const actions = getDialogActions(hideRolesDialog, roleToAdd, addRole, isRoleNameError, isOrganizationError, storeSnackBarMessage, openSnackBar)
    const roleName = roleToAdd.getIn(['name']);
    const roleOrganization = roleToAdd.getIn(['organization']);
    const readSelected = roleToAdd.getIn(['readPermissionSelected']);
    const writeSelected = roleToAdd.getIn(['writePermissionSelected']);
    const adminSelected = roleToAdd.getIn(['adminPermissionSelected']);

    return (
        <Dialog title={strings.adminDashboard.new_role} actions={actions} modal={false} open={rolesDialogShown} onRequestClose={() => hideRolesDialog()}>
            <div style={styles.container}>
                <div style={styles.textFieldDiv}>
                    <TextField errorText={showOrganizationError ? strings.adminDashboard.role_organization_error : ""} floatingLabelText={strings.adminDashboard.organization} value={roleOrganization} onChange={(event) => setRoleOrganization(event.target.value)} />
                    <TextField errorText={showRoleNameError ? strings.adminDashboard.role_name_error : ""} floatingLabelText={strings.adminDashboard.role} value={roleName} onChange={(event) => setRoleName(event.target.value)} />
                </div>
                <div style={styles.checkBoxDiv}>
                    <Checkbox label={strings.adminDashboard.read} style={styles.checkbox} checked={readSelected} disabled={true} onCheck={(event, isInputChecked) => setRoleReadPermission(isInputChecked)} />
                    <Checkbox label={strings.adminDashboard.write} style={styles.checkbox} value={writeSelected} onCheck={(event, isInputChecked) => setRoleWritePermission(isInputChecked)} />
                    <Checkbox label={strings.adminDashboard.admin} style={styles.checkbox} value={adminSelected} onCheck={(event, isInputChecked) => setRoleAdminPermission(isInputChecked)} />
                </div>
            </div>
        </Dialog>
    )
}
export default RolesDialog;