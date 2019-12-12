import ButtonBase from "@material-ui/core/ButtonBase";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import InputBase from "@material-ui/core/InputBase";
import Paper from "@material-ui/core/Paper";
import Tooltip from "@material-ui/core/Tooltip";
import CancelIcon from "@material-ui/icons/Cancel";
import SearchIcon from "@material-ui/icons/Search";
import React from "react";
import { withStyles } from "@material-ui/core";
import { DebounceInput } from "react-debounce-input";

const styles = {
  searchField: {
    padding: "2px",
    margin: "5px",
    width: "270px",
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  debounceInput: {}
};

const ProjectSearch = ({
  searchBarDisplayed,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm
}) => {
  return (
    <div style={{ display: "flex" }}>
      {searchBarDisplayed && !searchDisabled ? (
        <Paper style={styles.searchField}>
          <form onSubmit={e => e.preventDefault()} style={{ width: "90%" }}>
            <FormControl style={{ width: "97%", paddingLeft: "5px" }} data-test="project-search-field">
              <DebounceInput
                element={InputBase}
                debounceTimeout={300}
                onChange={event => storeSearchTerm(event.target.value)}
                onKeyDown={e => {
                  if (e.key === "Escape" || e.key === "Esc") {
                    storeSearchTerm("");
                    storeSearchBarDisplayed(false);
                  }
                }}
                style={styles.debounceInput}
                value={searchTerm}
                autoFocus={true}
              />
            </FormControl>
          </form>
          <ButtonBase
            data-test="clear-project-search"
            onClick={() => {
              storeSearchBarDisplayed(false);
              storeSearchTerm("");
            }}
          >
            <CancelIcon color="action" />
          </ButtonBase>
        </Paper>
      ) : null}
      <div>
        <Tooltip
          title="Quick search"
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
              data-test="toggle-project-search"
            >
              <SearchIcon />
            </IconButton>
          </div>
        </Tooltip>
      </div>
    </div>
  );
};

export default withStyles(styles)(ProjectSearch);
