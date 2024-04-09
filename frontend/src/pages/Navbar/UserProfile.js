import React from "react";

import CloseIcon from "@mui/icons-material/Close";
import DoneIcon from "@mui/icons-material/Done";
import EditIcon from "@mui/icons-material/Edit";
import EmailIcon from "@mui/icons-material/Email";
import GroupIcon from "@mui/icons-material/Group";
import { Avatar, Card, CardHeader, Dialog, DialogTitle, IconButton, TextField, Typography } from "@mui/material";

import { isEmailAddressValid } from "../../helper";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";

import "./UserProfile.scss";

const UserProfile = ({
  hideUserProfile,
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
    <Dialog onClose={hideUserProfile} className="user-paper-root" open={open} data-test="user-profile-dialog">
      <DialogTitle className="user-dialog-title">
        <div className="user-title">
          <Avatar src={avatar} />
          <Typography className="user-name">{displayName}</Typography>
        </div>
        <IconButton
          aria-label="close"
          className="user-close-button"
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
          className="user-card-header"
        />
      </Card>
      {emailServiceAvailable ? (
        <Card data-test="email-address-input" className="user-card">
          <CardHeader
            avatar={<EmailIcon aria-label="email"></EmailIcon>}
            title={strings.common.email}
            subheader={!userProfileEdit ? emailAddress || "-" : undefined}
            className="user-card-header"
            action={
              userProfileEdit ? (
                <div className="user-card-header-action">
                  {isEmailAddressInputValid ? (
                    <TextField
                      variant="standard"
                      className="email-text-field"
                      label={strings.common.email}
                      onChange={(e) => storeTempEmailAddress(e.target.value)}
                    />
                  ) : (
                    <TextField
                      variant="standard"
                      error
                      helperText={strings.userProfile.invalid_email_address}
                      className="email-text-field"
                      label={strings.common.email}
                      onChange={(e) => storeTempEmailAddress(e.target.value)}
                    />
                  )}
                  <ActionButton
                    ariaLabel="confirm email"
                    className="edit-button"
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
                </div>
              ) : (
                <ActionButton
                  ariaLabel="edit"
                  className="edit-button"
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

export default UserProfile;
