import React from "react";
import EmailIcon from "@material-ui/icons/Email";
import GroupIcon from "@material-ui/icons/Group";
import EditIcon from "@material-ui/icons/Edit";
import DoneIcon from "@material-ui/icons/Done";
import { Dialog, Card, Avatar, withStyles, DialogTitle, Typography, CardHeader, TextField } from "@material-ui/core";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

const styles = () => ({
  paperRoot: {
    width: "50%",
    overflow: "scrollable"
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
  }
});

const UserProfile = props => {
  const {
    open,
    classes,
    avatar,
    displayName,
    email,
    organization,
    hideUserProfile,
    userProfileEdit,
    enableUserProfileEdit,
    storeTempEmail,
    saveEmail,
    tempEmail,
    emailServiceAvailable
  } = props;
  return (
    <Dialog onClose={hideUserProfile} classes={{ paper: classes.paperRoot }} open={open}>
      <DialogTitle disableTypography={true} className={classes.title}>
        <Avatar className={classes.avatar} src={avatar} />
        <Typography className={classes.displayName}>{displayName}</Typography>
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
        <Card className={classes.card}>
          <CardHeader
            avatar={<EmailIcon aria-label="email"></EmailIcon>}
            title={strings.common.email}
            subheader={!userProfileEdit ? email || "-" : undefined}
            classes={{ avatar: classes.cardHeaderAvatar, root: classes.cardHeader, action: classes.cardHeaderAction }}
            action={
              userProfileEdit ? (
                <>
                  <TextField
                    className={classes.emailTextField}
                    label={strings.common.email}
                    onChange={e => storeTempEmail(e.target.value)}
                  />
                  <ActionButton
                    className={classes.editButton}
                    onClick={() => {
                      saveEmail(tempEmail);
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
