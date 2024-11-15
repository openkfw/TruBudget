import React from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import { InputBase } from "@mui/material";
import ButtonBase from "@mui/material/ButtonBase";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/system";

import strings from "../../localizeStrings";

import "./Searchbar.scss";

const StyledInput = styled(InputBase)(({ theme }) => ({
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.deepDarkBlue,
    opacity: 1
  }
}));

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
    <div className="search-bar" data-test="search-bar">
      {searchBarDisplayed && !searchDisabled ? (
        <Paper className="search-field">
          <form onSubmit={(e) => e.preventDefault()} className="form">
            <FormControl className="form-control-search" data-test="search-input">
              <StyledInput
                disableUnderline
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
                    <SearchIcon
                      sx={(theme) => ({
                        color: theme.palette.deepDarkBlue,
                        width: "1.3rem",
                        height: "1.3rem"
                      })}
                    />
                  </InputAdornment>
                }
                sx={{
                  "& .MuiInputBase-input": {
                    padding: "0 0 0 0"
                  }
                }}
              />
            </FormControl>
          </form>
          {searchTerm || !isSearchBarDisplayedByDefault ? (
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
