import React from 'react';
import Snackbar from 'material-ui/Snackbar';

const NotificationsSnackbar = (props) => {
    const snackbarStyle = props.snackBarMessageIsError ? {
        backgroundColor: 'red',
        color: 'white'
    } : undefined;

    return (
        <Snackbar open={ props.showSnackBar } message={ props.snackBarMessage } autoHideDuration={ 4000 } onRequestClose={ props.closeSnackBar } bodyStyle={ snackbarStyle }
        />
    )
}
export default NotificationsSnackbar;