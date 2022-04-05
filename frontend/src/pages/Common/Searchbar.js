import ButtonBase from "@mui/material/ButtonBase";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";
import { withStyles } from "@mui/styles";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import strings from "../../localizeStrings";

const styles = {
  searchBar: {
    display: "flex"
  },
  searchField: {
    margin: "17px",
    width: "270px",
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  formField: {
    width: "90%"
  },
  formControlField: {
    width: "97%",
    paddingLeft: "5px"
  }
};
const Searchbar = ({
  classes,
  searchBarDisplayed = true,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm,
  autoSearch = false,
  previewText,
  isSearchBarDisplayedByDefault = false
}) => {
  return (
    <div className={classes.searchBar} data-test="search-bar">
      {searchBarDisplayed && !searchDisabled ? (
        <Paper className={classes.searchField}>
          <form onSubmit={e => e.preventDefault()} className={classes.formField}>
            <FormControl className={classes.formControlField} data-test="search-input">
              <Input
                value={searchTerm}
                placeholder={previewText}
                autoFocus={!isSearchBarDisplayedByDefault}
                onChange={autoSearch ? event => storeSearchTerm(event.target.value) : null}
                onKeyDown={e => {
                  if (!isSearchBarDisplayedByDefault && (e.key === "Escape" || e.key === "Esc")) {
                    storeSearchTerm("");
                    storeSearchBarDisplayed(false);
                  } else if (e.key === "Enter") {
                    storeSearchTerm(e.target.value);
                  }
                }}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
              />
            </FormControl>
          </form>
          {!isSearchBarDisplayedByDefault ? (
            <ButtonBase
              data-test="clear-searchbar"
              onClick={() => {
                storeSearchTerm("");
                if (!isSearchBarDisplayedByDefault) {
                  storeSearchBarDisplayed(false);
                }
              }}
            >
              <CancelIcon color="action" />
            </ButtonBase>
          ) : null}
        </Paper>
      ) : null}
      <div>
        {!isSearchBarDisplayedByDefault ? (
          // Lupe button to toggle searchbar
          <Tooltip
            title={strings.searchBar.quick_search}
            disableHoverListener={searchDisabled}
            disableFocusListener={searchDisabled}
            disableTouchListener={searchDisabled}
          >
            <div>
              <IconButton
                color="primary"
                onClick={() => {
                  storeSearchTerm("");
                  storeSearchBarDisplayed(!searchBarDisplayed);
                }}
                disabled={searchDisabled}
                data-test="toggle-searchbar"
                size="large"
              >
                <SearchIcon />
              </IconButton>
            </div>
          </Tooltip>
        ) : null}
      </div>
    </div>
  );
};

export default withStyles(styles)(Searchbar);
