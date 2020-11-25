import React from "react";
import { withStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Chip from "@material-ui/core/Chip";
import UserIcon from "@material-ui/icons/Person";
import strings from "../../localizeStrings";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";

const styles = theme => ({
  chip: {
    margin: `${theme.spacing(0.5)}px ${theme.spacing(0.25)}px`
  },
  selection: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginTop: "20px",
    flexWrap: "wrap"
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    width: "210px"
  },
  formControlContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    whiteSpace: "nowrap",
    width: "-webkit-fill-available",
    overflow: "hidden",
    textOverflow: "ellipsis"
  }
});

class UserSelection extends React.Component {
  state = {
    searchTerm: "",
    selectIsOpen: false
  };

  handleChange = (item, selectedItems, users, addToSelection) => {
    if (selectedItems.indexOf(item) === -1) {
      const user = users.find(user => user.id === item);
      addToSelection(user.id);
    }

    this.setState({
      selectIsOpen: false,
      searchTerm: ""
    });
  };
  renderUser = (users, selectedItems, addToSelection) => {
    return users.map(u => {
      const { id, displayName } = u;
      return (
        <MenuItem
          data-test={`user-name-${id}`}
          key={id}
          onClick={() => this.handleChange(id, selectedItems, users, addToSelection)}
          component="div"
        >
          {displayName}
        </MenuItem>
      );
    });
  };
  renderUserSelection = (users, searchTerm, selectedItems, addToSelection) => {
    var suggestedUsers = [];
    searchTerm === ""
      ? (suggestedUsers = users)
      : (suggestedUsers = users.filter(u => u.displayName.toLowerCase().includes(searchTerm.toLowerCase())));
    return this.renderUser(suggestedUsers, selectedItems, addToSelection);
  };

  render() {
    const { classes, users, addToSelection, selectedItems, handleDelete } = this.props;
    const suggestedUsers = this.renderUserSelection(users, this.state.searchTerm, selectedItems, addToSelection);

    const openSelect = () => {
      if (this.props.onOpen !== undefined) this.props.onOpen();
      this.setState({ selectIsOpen: true });
    };
    return (
      <div style={{ marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "center", placeItems: "flex-end" }}>
          <div
            style={{
              marginTop: "5px",
              marginRight: "20px",
              marginBottom: "5px"
            }}
          >
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
              open={this.state.selectIsOpen}
              onOpen={openSelect}
              onClose={() =>
                this.setState(_state => {
                  return { searchTerm: "", selectIsOpen: false };
                })
              }
            >
              <div className={classes.formControlContainer}>
                <FormControl>
                  <InputLabel>{strings.common.search}</InputLabel>
                  <Input
                    inputProps={{ "data-test": "search-user-input" }}
                    value={this.state.searchTerm}
                    onChange={e => {
                      this.setState({ searchTerm: e.target.value });
                    }}
                  />
                </FormControl>
              </div>
              <div data-test="user-list">{suggestedUsers}</div>
            </Select>
          </FormControl>
        </div>
        <div className={classes.selection}>
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
}

export default withStyles(styles)(UserSelection);
