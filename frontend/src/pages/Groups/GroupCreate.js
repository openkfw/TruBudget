import React from "react";

import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import OrgaIcon from "@material-ui/icons/StoreMallDirectory";
import NameIcon from "@material-ui/icons/AssignmentInd";

import isEmpty from "lodash/isEmpty";

import strings from "../../localizeStrings";
import TextInputWithIcon from "../Common/TextInputWithIcon";
import AutoComplete from "../Common/AutoComplete";

const styles = {
  container: {
    marginTop: 40,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  card: {
    width: "100%",
    paddingBottom: "20px",
    overflow: "visible"
  },
  cardDiv: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  cardHeader: {
    width: "100%",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    width: 100,
    height: 100
  },
  headerText: {
    paddingRight: 0
  },
  headerFont: {
    fontSize: "25px"
  },
  cardActions: {
    marginTop: 20,
    display: "flex",
    justifyContent: "center"
  },
  cardContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "space-around"
  },
  textInputContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around"
  },
  textInput: {
    width: "50%"
  }
};

const handleCreate = (cb, showSnackbar, storeSnackbarMessage) => {
  cb();
  storeSnackbarMessage("Group created.");
  showSnackbar();
};



const GroupCreate = ({
  users,
  groupToAdd,
  storeGroupId,
  storeGroupName,
  addInitialUserToGroup,
  createUserGroup,
  editMode,
  showSnackbar,
  storeSnackbarMessage,
  removeInitialUserFromGroup,
  removeUserFromGroup,
  addUser
}) => {
  console.log(groupToAdd)
  const { groupId, displayName, groupUsers } = groupToAdd;


  const addUserToGroup = userId => {
    addUser(groupId, userId);
  };
  const removeUser = userId => {
    removeUserFromGroup(groupId, userId);
  };
  return (
    <div>
      <div style={styles.textInputContainer}>
        <TextInputWithIcon
          style={styles.textInput}
          label={editMode ? groupId : strings.common.id}
          error={false}
          disabled={editMode}
          icon={<NameIcon />}
          id="id"
          onChange={event => storeGroupId(event.target.value)}
        />
        <TextInputWithIcon
          style={styles.textInput}
          label={editMode ? displayName : strings.common.name}
          id="name"
          error={false}
          disabled={editMode}
          icon={<OrgaIcon />}
          onChange={event => storeGroupName(event.target.value)}
        />
      </div>
      <div>
        <AutoComplete
          users={users}
          addToSelection={editMode ? addUserToGroup : addInitialUserToGroup}
          selectedItems={groupUsers}
          handleDelete={editMode ? removeUser : removeInitialUserFromGroup}
        />
      </div>
    </div>
    // {!editMode ? (
    //   <CardActions style={styles.cardActions}>
    //     <Button
    //       variant="contained"
    //       color="primary"
    //       id="createuser"
    //       disabled={isEmpty(name) || isEmpty(groupId) || isEmpty(groupUsers)}
    //       onClick={() =>
    //         handleCreate(() => createUserGroup(groupId, name, groupUsers), showSnackbar, storeSnackbarMessage)
    //       }
    //     >
    //       {strings.common.create}
    //     </Button>
    //   </CardActions>
    // ) : null}

  );
};

export default GroupCreate;
