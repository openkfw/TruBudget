import {
  Avatar,
  Card,
  CardHeader,
  Dialog,
  DialogTitle,
  TextField,
  Typography,
  withStyles,
  IconButton
} from "@material-ui/core";
import DoneIcon from "@material-ui/icons/Done";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
import EmailIcon from "@material-ui/icons/Email";
import GroupIcon from "@material-ui/icons/Group";
import React, { Component } from "react";
import { connect } from "react-redux";
import { toJS } from "../../helper";
import strings from "../../localizeStrings";
import ActionButton from "../Common/ActionButton";
import {
  enableUserProfileEdit,
  hideUserProfile,
  saveEmailAddress,
  storeTempEmailAddress,
  setValidEmailAddressInput
} from "./actions";
import { fetchEmailAddress } from "../Login/actions";
import { isEmailAddressValid } from "../../helper";

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

class UserProfileContainer extends Component {
  render() {
    return (
      <Dialog
        onClose={this.props.hideUserProfile}
        classes={{ paper: this.props.classes.paperRoot }}
        open={this.props.open}
        data-test="user-profile-dialog"
      >
        <DialogTitle disableTypography={true} className={this.props.classes.flex}>
          <div className={this.props.classes.title}>
            <Avatar className={this.props.classes.avatar} src={this.props.avatar} />
            <Typography className={this.props.classes.displayName}>{this.props.displayName}</Typography>
          </div>
          <IconButton
            aria-label="close"
            className={this.props.classes.closeButton}
            onClick={this.props.hideUserProfile}
            data-test="close-user-profile"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Card>
          <CardHeader
            avatar={<GroupIcon aria-label="organization"></GroupIcon>}
            title={strings.common.organization}
            subheader={this.props.organization}
            classes={{ avatar: this.props.classes.cardHeaderAvatar, root: this.props.classes.cardHeader }}
          />
        </Card>
        {this.props.emailServiceAvailable ? (
          <Card data-test="email-address-input" className={this.props.classes.card}>
            <CardHeader
              avatar={<EmailIcon aria-label="email"></EmailIcon>}
              title={strings.common.email}
              subheader={!this.props.userProfileEdit ? this.props.emailAddress || "-" : undefined}
              classes={{
                avatar: this.props.classes.cardHeaderAvatar,
                root: this.props.classes.cardHeader,
                action: this.props.classes.cardHeaderAction
              }}
              action={
                this.props.userProfileEdit ? (
                  <>
                    {this.props.isEmailAddressInputValid ? (
                      <TextField
                        className={this.props.classes.emailTextField}
                        label={strings.common.email}
                        onChange={e => this.props.storeTempEmailAddress(e.target.value)}
                      />
                    ) : (
                      <TextField
                        error
                        helperText={strings.userProfile.invalid_email_address}
                        className={this.props.classes.emailTextField}
                        label={strings.common.email}
                        onChange={e => this.props.storeTempEmailAddress(e.target.value)}
                      />
                    )}
                    <ActionButton
                      className={this.props.classes.editButton}
                      onClick={() => {
                        if (isEmailAddressValid(this.props.tempEmailAddress)) {
                          this.props.setValidEmailAddressInput(true);
                          this.props.saveEmailAddress(this.props.tempEmailAddress);
                        } else {
                          this.props.setValidEmailAddressInput(false);
                        }
                      }}
                      title={strings.common.done}
                      icon={<DoneIcon />}
                    />
                  </>
                ) : (
                  <ActionButton
                    className={this.props.classes.editButton}
                    onClick={this.props.enableUserProfileEdit}
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
  }
}
const mapDispatchToProps = {
  enableUserProfileEdit,
  hideUserProfile,
  storeTempEmailAddress,
  saveEmailAddress,
  fetchEmailAddress,
  setValidEmailAddressInput
};

const mapStateToProps = state => {
  return {
    open: state.getIn(["navbar", "userProfileOpen"]),
    tempEmailAddress: state.getIn(["navbar", "tempEmailAddress"]),
    userProfileEdit: state.getIn(["navbar", "userProfileEdit"]),
    avatar: state.getIn(["login", "avatar"]),
    displayName: state.getIn(["login", "displayName"]),
    emailAddress: state.getIn(["login", "emailAddress"]),
    organization: state.getIn(["login", "organization"]),
    emailServiceAvailable: state.getIn(["login", "emailServiceAvailable"]),
    isEmailAddressInputValid: state.getIn(["navbar", "isEmailAddressInputValid"])
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(toJS(UserProfileContainer)));
