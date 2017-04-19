import React from 'react';

import Snackbar from 'material-ui/Snackbar';



const LiveNotification = (props) => {
  return (
  <div>
      <Snackbar
       open={props.showSnackBar}
       message={props.snackBarMessage}
       autoHideDuration={4000}
       onRequestClose={props.closeSnackBar}
       />
  </div>
  )
}

export default LiveNotification;
