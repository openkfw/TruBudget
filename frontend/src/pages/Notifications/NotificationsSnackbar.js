import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon
};

const styles = theme => ({
  success: {
    backgroundColor: theme.palette.primary.main
  },
  error: {
    backgroundColor: theme.palette.error.main
  },

  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit
  },
  message: {
    display: "flex",
    alignItems: "center"
  }
});

const ContentWrapper = props => {
  const { classes, className, message, variant, onClose } = props;
  const Icon = variantIcon[variant];
  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" className={classes.close} onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
      //workarround-fix: can be removed if material.ui fixed their issue (https://github.com/mui-org/material-ui/issues/13144)
      headlineMapping={{
        body1: "div",
        body2: "div"
      }}
    />
  );
};

const SnackbarContentWrapper = withStyles(styles)(ContentWrapper);

const NotificationsSnackbar = props => {
  return (
    <Snackbar open={props.showSnackbar} autoHideDuration={4000} onClose={props.closeSnackbar}>
      <SnackbarContentWrapper
        variant={props.snackbarError ? "error" : "success"}
        message={props.snackbarMessage}
        onClose={props.closeSnackbar}
      />
    </Snackbar>
  );
};
export default withStyles(styles)(NotificationsSnackbar);
