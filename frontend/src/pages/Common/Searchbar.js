import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import ButtonBase from "@mui/material/ButtonBase";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import Input from "@mui/material/Input";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

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
  searchBarDisplayed = true,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm,
  safeOnChange = false,
  previewText,
  isSearchBarDisplayedByDefault = false
}) => {
  return (
    <div style={styles.searchBar} data-test="search-bar">
      {searchBarDisplayed && !searchDisabled ? (
        <Paper style={styles.searchField}>
          <form onSubmit={(e) => e.preventDefault()} style={styles.formField}>
            <FormControl style={styles.formControlField} data-test="search-input">
              <Input
                value={searchTerm}
                placeholder={previewText}
                autoFocus={!isSearchBarDisplayedByDefault}
                onChange={safeOnChange ? (event) => storeSearchTerm(event.target.value) : null}
                onKeyDown={(e) => {
                  if (e.key === "Escape" || e.key === "Esc") {
                    storeSearchTerm("");
                    if (!isSearchBarDisplayedByDefault) {
                      storeSearchBarDisplayed(false);
                    }
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
      <>
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
                aria-label="toggle searchbar"
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
      </>
    </div>
  );
};

export default Searchbar;
