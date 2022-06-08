import { Avatar, Card, CardHeader, Dialog, DialogTitle, IconButton, TextField, Typography } from "@mui/material";
import { withStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import GroupIcon from "@mui/icons-material/Group";
import React from "react";

import { isEmailAddressValid } from "../../helper";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

const styles = () => ({
  paperRoot: {
    width: "50%",
    overflow: "scrollable"
  },
  flex: {
    display: "flex"
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto"
  },
  displayName: {
    marginLeft: "8px"
  },
  card: {
    display: "flex",
    alignItems: "center"
  },
  editButton: {
    marginRight: "16px"
  },
  cardHeader: {
    width: "100%"
  },
  cardHeaderAvatar: {
    margin: "0px 32px 0px 32px"
  },
  cardText: {
    marginLeft: "8px",
    display: "flex",
    flexDirection: "column"
  },
  emailTextField: {
    width: "-webkit-fill-available",
    marginRight: "32px"
  },
  cardHeaderAction: {
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end"
  },
  closeButton: {
    marginLeft: "auto"
  }
});

const UserProfile = ({
  hideUserProfile,
  classes,
  open,
  avatar,
  displayName,
  organization,
  emailServiceAvailable,
  userProfileEdit,
  emailAddress,
  isEmailAddressInputValid,
  storeTempEmailAddress,
  tempEmailAddress,
  setValidEmailAddressInput,
  saveEmailAddress,
  enableUserProfileEdit
}) => {
  return (
    <Dialog
      onClose={hideUserProfile}
      classes={{ paper: classes.paperRoot }}
      open={open}
      data-test="user-profile-dialog"
    >
      <DialogTitle className={classes.flex}>
        <div className={classes.title}>
          <Avatar className={classes.avatar} src={avatar} />
          <Typography className={classes.displayName}>{displayName}</Typography>
        </div>
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={hideUserProfile}
          data-test="close-user-profile"
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Card>
        <CardHeader
          avatar={<GroupIcon aria-label="organization"></GroupIcon>}
          title={strings.common.organization}
          subheader={organization}
          classes={{ avatar: classes.cardHeaderAvatar, root: classes.cardHeader }}
        />
      </Card>
      {emailServiceAvailable ? (
        <Card data-test="email-address-input" className={classes.card}>
          <CardHeader
            avatar={<EmailIcon aria-label="email"></EmailIcon>}
            title={strings.common.email}
            subheader={!userProfileEdit ? emailAddress || "-" : undefined}
            classes={{
              avatar: classes.cardHeaderAvatar,
              root: classes.cardHeader,
              action: classes.cardHeaderAction
            }}
            action={
              userProfileEdit ? (
                <>
                  {isEmailAddressInputValid ? (
                    <TextField
                      variant="standard"
                      className={classes.emailTextField}
                      label={strings.common.email}
                      onChange={e => storeTempEmailAddress(e.target.value)}
                    />
                  ) : (
                    <TextField
                      variant="standard"
                      error
                      helperText={strings.userProfile.invalid_email_address}
                      className={classes.emailTextField}
                      label={strings.common.email}
                      onChange={e => storeTempEmailAddress(e.target.value)}
                    />
                  )}
                  <ActionButton
                    className={classes.editButton}
                    onClick={() => {
                      if (isEmailAddressValid(tempEmailAddress)) {
                        setValidEmailAddressInput(true);
                        saveEmailAddress(tempEmailAddress);
                      } else {
                        setValidEmailAddressInput(false);
                      }
                    }}
                    title={strings.common.done}
                    icon={<DoneIcon />}
                  />
                </>
              ) : (
                <ActionButton
                  className={classes.editButton}
                  onClick={enableUserProfileEdit}
                  title={strings.common.edit}
                  icon={<EditIcon />}
                />
              )
            }
          />
        </Card>
      ) : null}
    </Dialog>
  );
};

export default withStyles(styles)(UserProfile);
