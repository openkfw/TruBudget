import React, { Component } from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import CloseIcon from "@mui/icons-material/Close";
import { Checkbox, IconButton } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Radio from "@mui/material/Radio";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";

import strings from "../../localizeStrings";

import ActionButton from "./ActionButton";
import OverflowTooltip from "./OverflowTooltip";

import "./SingleSelection.scss";

class SingleSelection extends Component {
  constructor() {
    super();
    this.state = {
      searchTerm: "",
      selectIsOpen: false
    };
  }

  renderSelection(selectableItems, selectId, disabled) {
    return selectableItems.map((u) => {
      const { id, displayName } = u;
      const isChecked = id === selectId;
      return (
        <MenuItem
          key={id}
          value={id}
          data-test={isChecked ? "selected-item" : "not-selected-item"}
          onClick={() => (id !== selectId ? this.props.onSelect(id, displayName) : undefined)}
        >
          <Radio className="radio-button" disabled={disabled} checked={isChecked} />
          <ListItemText data-test={`single-select-name-${id}`}>
            <OverflowTooltip text={displayName} maxWidth="none" />
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
    const selection = this.renderSelection(
      selectableItems.filter(
        (u) => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup !== true
      ),
      selectId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className="list-sub-header"> {strings.users.users} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  renderGroupSelection = (selectableItems, selectId, disabled) => {
    const selection = this.renderSelection(
      selectableItems.filter(
        (u) => u.displayName.toLowerCase().includes(this.state.searchTerm.toLowerCase()) && u.isGroup === true
      ),
      selectId,
      disabled
    );
    if (selection.length > 0) {
      return (
        <div>
          <ListSubheader className="list-sub-header"> {strings.users.groups} </ListSubheader>
          {selection}
        </div>
      );
    } else {
      return null;
    }
  };

  render() {
    const { selectId, selectableItems, disabled, workflowSortEnabled, status, floatingLabel, onClearItem } = this.props;
    const suggestedUsers = this.renderUserSelection(selectableItems, selectId, disabled);
    const suggestedGroups = this.renderGroupSelection(selectableItems, selectId, disabled);
    const selectedItem = selectableItems.find((s) => s.id === selectId);

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
          className="form-control"
        >
          <InputLabel htmlFor={selectId}>{floatingLabel}</InputLabel>
          <Select
            data-test={"single-select" + (disabled ? "-disabled" : "")}
            variant="standard"
            className={workflowSortEnabled && status !== "closed" ? "select" : ""}
            value={selectedItem ? this.renderTitle(selectedItem) : []}
            renderValue={(name) => {
              return selectedItem ? (
                <div className="select-value">
                  <Checkbox className="radio-button" disabled={disabled} checked={true} />
                  <Typography disabled={disabled} variant="body1" className="assignee-typography">
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
                  inputProps={{ "data-test": "search-single-select-field" }}
                  value={this.state.searchTerm}
                  onChange={(e) => this.setState({ searchTerm: e.target.value })}
                />
              </FormControl>
            </div>
            <div data-test="single-select-list">
              <Paper className="item-container">
                <List>
                  {suggestedUsers}
                  {suggestedGroups}
                </List>
              </Paper>
            </div>
          </Select>
        </FormControl>
        {onClearItem && selectedItem ? (
          <IconButton
            aria-label="cancel"
            data-test={"clear-validator"}
            className="clear-button"
            onClick={onClearItem}
            size="large"
          >
            <CancelIcon color="action" style={{ fontSize: "x-large" }} />
          </IconButton>
        ) : null}
      </>
    );
  }
}

export default SingleSelection;
