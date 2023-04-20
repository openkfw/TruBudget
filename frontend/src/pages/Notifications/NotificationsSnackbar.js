import React from "react";

import { Alert as MuiAlert, Snackbar as MuiSnackbar } from "@mui/material";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NotificationsSnackbar = (props) => {
  const { showSnackbar, closeSnackbar, snackbarMessage, snackbarError, snackbarWarning } = props;

  let variant = "info";
  if (snackbarWarning) {
    variant = "warning";
  }
  if (snackbarError) {
    variant = "error";
  }

  const handleClose = (_event, reason) => {
    if (reason === "clickaway") {
      // Do not hide when click some where: Instead, wait the autoHideDuration
      return;
    }
    closeSnackbar();
  };

  return (
    <>
      <MuiSnackbar
        open={showSnackbar}
        onClose={handleClose}
        autoHideDuration={6000}
        message={snackbarMessage}
        data-test="client-snackbar"
        sx={{ maxWidth: "100rem" }}
      >
        <Alert severity={variant} onClose={() => closeSnackbar()}>
          {snackbarMessage}
        </Alert>
      </MuiSnackbar>
    </>
  );
};

export default NotificationsSnackbar;
