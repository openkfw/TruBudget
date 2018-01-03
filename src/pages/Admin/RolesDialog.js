import React from 'react';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import strings from '../../localizeStrings';

const getDialogActions = (hideRolesDialog) => {

    const cancelButton = <FlatButton aria-label='cancel' label={ strings.common.cancel } secondary={ true } onTouchTap={ () => hideRolesDialog() } />
    const submitButton = <FlatButton aria-label='submit' label={ strings.common.submit } primary={ true } onTouchTap={ () => hideRolesDialog() } />
    return [
        cancelButton,
        submitButton
    ]
}

const RolesDialog = (props) => {
    const {rolesDialogShown, hideRolesDialog} = props;
    const actions = getDialogActions(hideRolesDialog)
    return (
        <Dialog title="Add Roles " actions={ actions } modal={ false } open={ rolesDialogShown } onRequestClose={ () => hideRolesDialog() }>
        </Dialog>
    )
}
export default RolesDialog;