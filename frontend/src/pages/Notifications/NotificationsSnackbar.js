import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import SnackbarContent from "@material-ui/core/SnackbarContent";
import IconButton from "@material-ui/core/IconButton";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import ErrorIcon from "@material-ui/icons/Error";
import WarningRoundedIcon from "@material-ui/icons/WarningRounded";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";

const variantIcon = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  warning: WarningRoundedIcon
};

const styles = theme => ({
  success: {
    backgroundColor: theme.palette.primary.main
  },
  error: {
    backgroundColor: theme.palette.error.main
  },
  warning: {
    backgroundColor: theme.palette.warning.main
  },

  icon: {
    fontSize: 20
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing(1)
  },
  message: {
    display: "flex",
    alignItems: "center",
    maxWidth: "100%"
  }
});

const ContentWrapper = props => {
  const { classes, className, message, variant, onClose } = props;
  const Icon = variantIcon[variant];
  return (
    <SnackbarContent
      className={`${classes[variant]} ${className}`}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" data-test="client-snackbar" className={classes.message}>
          <Icon className={`${classes.icon} ${classes.iconVariant}`} />
          {message}
        </span>
      }
      action={[
        <IconButton key="close" aria-label="Close" color="inherit" className={classes.close} onClick={onClose}>
          <CloseIcon className={classes.icon} />
        </IconButton>
      ]}
    />
  );
};

const SnackbarContentWrapper = withStyles(styles)(ContentWrapper);

const NotificationsSnackbar = props => {
  var snackbarVariant = "error";
  if (!props.snackbarError) {
    snackbarVariant = props.snackbarWarning ? "warning" : "success";
  }

  return (
    <Snackbar open={props.showSnackbar} autoHideDuration={4000} onClose={props.closeSnackbar}>
      <SnackbarContentWrapper variant={snackbarVariant} message={props.snackbarMessage} onClose={props.closeSnackbar} />
    </Snackbar>
  );
};
export default withStyles(styles)(NotificationsSnackbar);
