import React from "react";
import { withStyles } from "@material-ui/core";
import Searchbar from "./Searchbar";
import strings from "../../localizeStrings";

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
    <Searchbar
      data-test="project-search"
      searchBarDisplayed={searchBarDisplayed}
      searchTerm={searchTerm}
      searchDisabled={searchDisabled}
      storeSearchBarDisplayed={storeSearchBarDisplayed}
      storeSearchTerm={storeSearchTerm}
      autoSearch={true}
      previewText={strings.common.project_searchtext}
    />
  );
};

export default withStyles(styles)(ProjectSearch);
