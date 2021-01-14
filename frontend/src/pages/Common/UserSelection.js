import React, { useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import UserIcon from "@material-ui/icons/Person";
import CloseIcon from "@material-ui/icons/Close";
import strings from "../../localizeStrings";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import ActionButton from "./ActionButton";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import OverflowTooltip from "./OverflowTooltip";

const styles = theme => ({
  container: { marginTop: "30px" },
  closeButtonContainer: { float: "right", marginTop: -8 },
  closeButtonSize: { fontSize: 15 },
  userSelection: { display: "flex", justifyContent: "center", placeItems: "flex-end" },
  userIcon: {
    marginTop: "5px",
    marginRight: "20px",
    marginBottom: "5px"
  },
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`
  },
  chipSelection: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap"
  },
  formControl: {
    width: "200px"
  },
  formControlContainer: {
    display: "flex",
    margin: 16,
    justifyContent: "flex-start"
  },
  label: {
    whiteSpace: "nowrap",
    width: "-webkit-fill-available",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  itemContainer: { maxHeight: "70vh", overflow: "auto", maxWidth: "300px", minWidth: "300px" }
});

function UserSelection(props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectIsOpen, setSelectIsOpen] = useState(false);

  const handleChange = (item, selectedItems, users, addToSelection) => {
    if (selectedItems.indexOf(item) === -1) {
      const user = users.find(user => user.id === item);
      addToSelection(user.id);
    }
    if (selectedItems.indexOf(item) > -1) {
      handleDelete(item);
    }
  };
  const renderUser = (users, selectedItems, addToSelection) => {
    return users.map(u => {
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
      : (suggestedUsers = users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase())));
    return renderUser(suggestedUsers, selectedItems, addToSelection);
  };

  const { classes, users, addToSelection, selectedItems, handleDelete } = props;
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
    <div className={classes.container}>
      <div className={classes.userSelection}>
        <div className={classes.userIcon}>
          <UserIcon />
        </div>
        <FormControl data-test="add-user-container" className={classes.formControl}>
          <InputLabel className={classes.label} shrink={false}>
            {selectedItems.length + " " + strings.users.selected_users}
          </InputLabel>
          <Select
            data-test="add-user-selection"
            value={[""]}
            multiple
            open={selectIsOpen}
            onOpen={openSelect}
            onClose={closeSelect}
          >
            <div className={classes.closeButtonContainer}>
              <ActionButton
                data-test={"close-select"}
                onClick={closeSelect}
                title={strings.common.close}
                iconButtonStyle={{ width: 15, height: 15 }}
                icon={<CloseIcon className={classes.closeButtonSize} />}
              />
            </div>
            <div className={classes.formControlContainer}>
              <FormControl>
                <InputLabel>{strings.common.search}</InputLabel>
                <Input
                  inputProps={{ "data-test": "search-user-input" }}
                  value={searchTerm}
                  onChange={e => {
                    setSearchTerm(e.target.value);
                  }}
                />
              </FormControl>
            </div>
            <div data-test="user-list">
              <Paper className={classes.itemContainer}>
                <List>{suggestedUsers}</List>
              </Paper>
            </div>
          </Select>
        </FormControl>
      </div>
      <div className={classes.chipSelection}>
        {selectedItems.map(item => (
          <Chip
            data-test={`user-chip-${item}`}
            key={item}
            tabIndex={-1}
            label={item}
            className={classes.chip}
            onDelete={() => handleDelete(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default withStyles(styles)(UserSelection);
