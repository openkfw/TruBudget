import { Checkbox, IconButton } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import Radio from "@material-ui/core/Radio";
import Select from "@material-ui/core/Select";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import CancelIcon from "@material-ui/icons/Cancel";
import CloseIcon from "@material-ui/icons/Close";
import React, { Component } from "react";

import strings from "../../localizeStrings";
import ActionButton from "./ActionButton";
import OverflowTooltip from "./OverflowTooltip";

const styles = {
  formControl: {
    minWidth: "200px",
    maxWidth: "200px"
  },
  radioButton: {
    height: "10px"
  },
  selectValue: {
    width: "100%",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  },
  formControlContainer: {
    display: "flex",
    margin: 16,
    justifyContent: "flex-start"
  },
  select: {
    maxWidth: "200px",
    "&$disabled": {
      cursor: "-webkit-grab"
    }
  },
  assigneeTypography: {
    overflow: "hidden",
    textOverflow: "ellipsis"
  },
  nameContainer: {
    maxWidth: "200px"
  },
  listSubHeader: { top: "auto" },
  disabled: {},
  closeButtonContainer: { float: "right", marginTop: -8 },
  closeButtonSize: { fontSize: 15 },
  itemContainer: { maxHeight: "70vh", overflow: "auto", boxShadow: "none" },
  clearButton: {
    width: 45,
    height: 45,
    alignSelf: "flex-end",
    marginLeft: "5px"
  }
};

class SingleSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      selectIsOpen: false
    };
  }

  renderSelection(selectableItems, selectId, disabled) {
    const { classes } = this.props;
    return selectableItems.map(u => {
      const { id, displayName } = u;
      return (
        <MenuItem
          key={id}
          value={id}
          onClick={() => (id !== selectId ? this.props.onSelect(id, displayName) : undefined)}
        >
          <Radio className={classes.radioButton} disabled={disabled} checked={id === selectId} />
          <ListItemText data-test={`single-select-name-${id}`} className={classes.nameContainer}>
            <OverflowTooltip text={displayName} />
          </ListItemText>
        </MenuItem>
      );
    });
  }

  renderTitle(selectedItem) {
    if (!selectedItem) {
      return ["..."];
    }
    return [selectedItem.displayName];
  }

  renderUserSelection = (selectableItems, selectId, disabled) => {
    const { classes } = this.props;
    const selection = this.renderSelection(
      selectableItems.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
      ),
      selectId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className={classes.listSubHeader}> {strings.users.users} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = (selectableItems, selectId, disabled) => {
    const { classes } = this.props;
    const selection = this.renderSelection(
      selectableItems.filter(
        u => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
      ),
      selectId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className={classes.listSubHeader}> {strings.users.groups} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  render() {
    const {
      selectId,
      selectableItems,
      disabled,
      classes,
      workflowSortEnabled,
      status,
      floatingLabel,
      onClearItem
    } = this.props;
    const suggestedUsers = this.renderUserSelection(selectableItems, selectId, disabled);
    const suggestedGroups = this.renderGroupSelection(selectableItems, selectId, disabled);
    const selectedItem = selectableItems.find(s => s.id === selectId);
    const getSortClasses = () => {
      if (workflowSortEnabled) {
        if (status !== "closed") {
          return {
            select: classes.select,
            disabled: classes.disabled
          };
        }
      }
      return;
    };

    const openSelect = () => {
      if (this.props.onOpen !== undefined) this.props.onOpen();
      this.setState({ selectIsOpen: true });
    };

    const closeSelect = () => {
      this.setState({ searchTerm: "", selectIsOpen: false });
    };

    return (
      <>
        <FormControl
          data-test={"single-select-container" + (disabled ? "-disabled" : "")}
          disabled={disabled}
          className={classes.formControl}
        >
          <InputLabel htmlFor={selectId}>{floatingLabel}</InputLabel>
          <Select
            data-test={"single-select" + (disabled ? "-disabled" : "")}
            classes={{
              ...getSortClasses()
            }}
            value={selectedItem ? this.renderTitle(selectedItem) : []}
            renderValue={name => {
              return selectedItem ? (
                <div className={classes.selectValue}>
                  <Checkbox className={classes.radioButton} disabled={disabled} checked={true} />
                  <Typography disabled={disabled} variant="body1" className={classes.assigneeTypography}>
                    {name}
                  </Typography>
                </div>
              ) : null;
            }}
            multiple
            open={this.state.selectIsOpen}
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
                  inputProps={{ "data-test": "search-single-select-field" }}
                  value={this.state.searchTerm}
                  onChange={e => this.setState({ searchTerm: e.target.value })}
                />
              </FormControl>
            </div>
            <div data-test="single-select-list">
              <Paper className={classes.itemContainer}>
                <List>
                  {suggestedUsers}
                  {suggestedGroups}
                </List>
              </Paper>
            </div>
          </Select>
        </FormControl>
        {onClearItem && selectedItem ? (
          <IconButton data-test={"clear-validator"} style={styles.clearButton} onClick={onClearItem}>
            <CancelIcon color="action" style={{ fontSize: "x-large" }} />
          </IconButton>
        ) : null}
      </>
    );
  }
}

export default withStyles(styles)(SingleSelection);
