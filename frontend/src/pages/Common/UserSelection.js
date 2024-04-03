import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import UserIcon from "@mui/icons-material/Person";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";

import strings from "../../localizeStrings";

import ActionButton from "./ActionButton";
import OverflowTooltip from "./OverflowTooltip";

import "./UserSelection.scss";

function UserSelection(props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectIsOpen, setSelectIsOpen] = useState(false);

  const handleChange = (item, selectedItems, users, addToSelection) => {
    if (selectedItems.indexOf(item) === -1) {
      const user = users.find((user) => user.id === item);
      addToSelection(user.id);
    }
    if (selectedItems.indexOf(item) > -1) {
      handleDelete(item);
    }
  };
  const renderUser = (users, selectedItems, addToSelection) => {
    return users.map((u) => {
      const checked = selectedItems.indexOf(u.id) > -1;
      const { id, displayName } = u;
      return (
        <MenuItem
          data-test={`user-name-${id}`}
          key={id}
          onClick={() => handleChange(id, selectedItems, users, addToSelection)}
          component="div"
        >
          <Checkbox checked={checked} />
          <ListItemText>
            <OverflowTooltip text={displayName} />
          </ListItemText>
        </MenuItem>
      );
    });
  };
  const renderUserSelection = (users, searchTerm, selectedItems, addToSelection) => {
    let suggestedUsers = [];
    searchTerm === ""
      ? (suggestedUsers = users)
      : (suggestedUsers = users.filter((u) => u.displayName.toLowerCase().includes(searchTerm.toLowerCase())));
    return renderUser(suggestedUsers, selectedItems, addToSelection);
  };

  const { users, addToSelection, selectedItems, handleDelete } = props;
  const suggestedUsers = renderUserSelection(users, searchTerm, selectedItems, addToSelection);

  const openSelect = () => {
    if (props.onOpen !== undefined) props.onOpen();
    setSelectIsOpen(true);
  };

  const closeSelect = () => {
    setSelectIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="user-selection-container">
      <div className="user-selection">
        <div className="user-icon">
          <UserIcon />
        </div>
        <FormControl data-test="add-user-container" className="form-control">
          <InputLabel className="label" shrink={false}>
            {selectedItems.length + " " + strings.users.selected_users}
          </InputLabel>
          <Select
            variant="standard"
            data-test="add-user-selection"
            value={[""]}
            multiple
            open={selectIsOpen}
            onOpen={openSelect}
            onClose={closeSelect}
          >
            <div className="close-button-container">
              <ActionButton
                ariaLabel="close"
                data-test={"close-select"}
                onClick={closeSelect}
                title={strings.common.close}
                className="icon-button-style"
                icon={<CloseIcon className="close-button-size" />}
              />
            </div>
            <div className="form-control-container">
              <FormControl>
                <InputLabel>{strings.common.search}</InputLabel>
                <Input
                  inputProps={{ "data-test": "search-user-input" }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                  }}
                />
              </FormControl>
            </div>
            <div data-test="user-list">
              <Paper className="item-container">
                <List>{suggestedUsers}</List>
              </Paper>
            </div>
          </Select>
        </FormControl>
      </div>
      <div className="chip-selection">
        {selectedItems.map((item) => (
          <Chip
            data-test={`user-chip-${item}`}
            key={item}
            tabIndex={-1}
            label={item}
            className="chip"
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default UserSelection;
